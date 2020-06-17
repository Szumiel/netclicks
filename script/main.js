const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const SERVER = 'https://api.themoviedb.org/3';
const API_KEY = '17ead2be16b214493a847fd63d456329';

// элементы 
const leftMenu = document.querySelector('.left-menu'),
    hamburger = document.querySelector('.hamburger'),
    tvShowsList = document.querySelector('.tv-shows__list'),
    modal = document.querySelector('.modal'),
    tvShows = document.querySelector('.tv-shows'),
    tvCardImg = document.querySelector('.tv-card__img'),
    modalTitle = document.querySelector('.modal__title'),
    genresList = document.querySelector('.genres-list'),
    rating = document.querySelector('.rating'),
    description = document.querySelector('.description'),
    modalLink = document.querySelector('.modal__link'),
    searchForm = document.querySelector('.search__form'),
    searchFormInput = document.querySelector('.search__form-input'),
    preloader = document.querySelector('.preloader'),
    dropdown = document.querySelectorAll('.dropdown'),
    tvShowsHead = document.querySelector('.tv-shows__head');

const loading = document.createElement('div');
loading.className = 'loading';


// пока хз что и для чего(создание карточек)
const DBService = class {
    getData = async (url) => {
        const res = await fetch(url);
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Sosi hyi, file  ${url} ne naiden, faggot`)
        }

    }
    getTestData = () => {
        return this.getData('test.json')
    };
    getTestCard = () => {
        return this.getData('card.json')
    };
    getSearchResulte = query => {
        return this.getData(`${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`);
    }
    getTvShow = id => {
        return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`);
    }
}


// console.log(new DBService().getSearchResulte('Няня'))

const renderCard = data => {
    tvShowsList.textContent = '';

    console.log(data);

    if (!data.total_results) {
        loading.remove();
        tvShowsHead.textContent = 'Ты дебил, блять, сука пидор?';
        tvShowsHead.style.cssText = 'color: red; text-align: center; font-size: 50px;'
        return;
    };

    tvShowsHead.textContent = 'Результат поиска';
    tvShowsHead.style.cssText = 'color: green; text-align: left; font-size: 1.17em;'

    data.results.forEach(item => {

        const { backdrop_path: backdrop, 
            name: title, 
            poster_path: poster, 
            vote_average: vote,
            id
        } = item;
    
        const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
        const backdropIMG = backdrop ? IMG_URL + backdrop : '';
        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

        const card = document.createElement('li');
        card.idTV = id;
        card.classList.add('tv-shows__item');
        card.innerHTML = `
        <a href="#" id="${id}" class="tv-card">
            ${voteElem}
            <img class="tv-card__img"
                src="${posterIMG}"
                data-backdrop="${backdropIMG}"
                alt="${title}">
            <h4 class="tv-card__head">${title}</h4>
        </a>
    `;
    loading.remove();
    tvShowsList.append(card);
    });
};

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const value = searchFormInput.value.trim();
    searchFormInput.value = '';
    if (value) {
        tvShows.append(loading);
        new DBService().getSearchResulte(value).then(renderCard);
    }
});


// меню
//  Открытие/закрытие меню
const closeDropdown = () => {
    dropdown.forEach(item => {
        item.classList.remove('active');
    })
}

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
    closeDropdown();
});

document.addEventListener('click', (event) => {
    const target = event.target;
    if (!target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
        closeDropdown();
    }
});

leftMenu.addEventListener('click', event => {
    event.preventDefault(); 
    const target = event.target;
    const dropdown = target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }
});

// открытие модального окна

tvShowsList.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    const card = target.closest('.tv-card');
    if (card) {
        preloader.style.display = 'block';
        new DBService().getTvShow(card.id).then(data => {
            tvCardImg.src = IMG_URL + data.poster_path;
            modalTitle.textContent = data.name;
            genresList.textContent = '';
        // genresList.innerHTML = data.genres.reduce((acc, item) => `${acc}<li>${item.name}</li>`, '');
        // тоже самое, что ниже
        // for (const item of data.genres) {
        //     genresList.innerHTML += `<li>${item.name}</li>`;
        // }
            data.genres.forEach (item => {
                genresList.innerHTML += `<li>${item.name}</li>`;
            });
            rating.textContent = data.vote_average;
            description.textContent = data.overview;
            modalLink.href = data.homepage;
        })
        .then(() => {
            document.body.style.overflow = 'hidden';
            modal.classList.remove('hide');
        })
        .finally(() => {
            preloader.style.display = '';
        });
    }
});

// закрытие модального окна

modal.addEventListener('click', event => {
    if (event.target.closest('.cross') || event.target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
});

// смена карточки

const changeImage = event => {
    const card = event.target.closest('.tv-shows__item');

    if (card) {
        const img = card.querySelector('.tv-card__img');
        const changeImage = img.dataset.backdrop;
        if (changeImage) {
            img.dataset.backdrop = img.src;
            img.src = changeImage;
        }
    }
};

tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);