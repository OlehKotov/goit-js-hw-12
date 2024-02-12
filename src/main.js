import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import errorIcon from './img/bi_x-octagon.svg';
import axios from 'axios';

const refs = {
  form: document.querySelector('.form'),
  gallery: document.querySelector('.gallery'),
  loader: document.querySelector('.loader'),
  btnLoadMore: document.querySelector('.btn-load-more'),
};

let query = '';
let currentPage = 1;
let total = 0;
const PER_PAGE = 15;

async function getImages() {
  const BASE_URL = 'https://pixabay.com/api/';
  const KEY = '42132229-e88b92984f0d2a7001cb07c65';
  const url = `${BASE_URL}?key=${KEY}`;
  try {
    const { data } = await axios.get(url, {
      params: {
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        q: query,
        per_page: PER_PAGE,
        page: currentPage,
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
}

refs.form.addEventListener('submit', onFormSubmit);
refs.btnLoadMore.addEventListener('click', loadMore);

async function onFormSubmit(event) {
  event.preventDefault();
  refs.btnLoadMore.classList.add('hidden');
  if (query == event.target.elements.query.value.trim()) {
    event.target.reset();
    return;
  } else {
    query = event.target.elements.query.value.trim();
  }
  currentPage = 1;
  refs.gallery.innerHTML = '';
  toggleLoader();

  try {
    const data = await getImages();
    if (!query) {
      iziToast.warning({
        message: 'Sorry, you forgot to enter a search term. Please try again!',
        position: 'topRight',
        messageSize: '16px',
        timeout: 2000,
      });
      toggleLoader();
      return;
    } else if (parseInt(data.totalHits) > 0) {
      toggleBtnLoadMore();
      renderMarkup(data.hits);
      total = data.totalHits;
      checkBtnStatus();
      toggleLoader();
    } else {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
        backgroundColor: 'red',
        messageColor: 'white',
        messageSize: '16px',
        iconColor: 'white',
        iconUrl: errorIcon,
        color: 'white',
        timeout: 2000,
      });
      toggleLoader();
    }
  } catch (error) {
    iziToast.error({
      message: 'Error',
      position: 'topRight',
      backgroundColor: 'red',
      messageColor: 'white',
      messageSize: '16px',
      iconColor: 'white',
      iconUrl: errorIcon,
      color: 'white',
      timeout: 2000,
    });
    toggleLoader();
  }
  event.target.reset();
}

function galleryTemplate({
  largeImageURL,
  webformatURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `<a class='gallery-link' href='${largeImageURL}'><img class='gallery-image' src='${webformatURL}' alt='${tags}'/>
  <div class='gallery-review'>
  <div class='gallery-review-item'><b>Likes</b> <span>${likes}</span></div>
  <div class='gallery-review-item'><b>Views</b> <span>${views}</span></div>
  <div class='gallery-review-item'><b>Comments</b> <span>${comments}</span></div>
  <div class='gallery-review-item'><b>Downloads</b> <span>${downloads}</span></div>
  </div></a>
    `;
}

let gallery = new SimpleLightbox('.gallery a', {
  showCounter: false,
  captionDelay: 250,
  captions: true,
  captionsData: 'alt',
  captionPosition: 'bottom',
});

function renderMarkup(images) {
  const markup = images.map(galleryTemplate).join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  gallery.refresh();
}

async function loadMore() {
  toggleLoader();
  toggleBtnLoadMore();
  currentPage += 1;
  const data = await getImages();
  renderMarkup(data.hits);
  checkBtnStatus();
  toggleLoader();
  toggleBtnLoadMore();
  scrollByGalleryCardHeight();
}

function checkBtnStatus() {
  const maxPage = Math.ceil(total / PER_PAGE);
  const isLastPage = maxPage <= currentPage;
  if (isLastPage) {
    refs.btnLoadMore.classList.add('hidden');
    iziToast.info({
      message: "We're sorry, but you've reached the end of search results.",
      position: 'topRight',
      messageSize: '16px',
      timeout: 2000,
    });
  }
}

function toggleLoader() {
  refs.loader.classList.toggle('hidden');
}

function toggleBtnLoadMore() {
  refs.btnLoadMore.classList.toggle('hidden');
}

function scrollByGalleryCardHeight() {
  const galleryCard = document.querySelector('.gallery-link');
  if (galleryCard) {
    const cardRect = galleryCard.getBoundingClientRect();
    const cardHeight = cardRect.height;
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } else {
    return;
  }
}
