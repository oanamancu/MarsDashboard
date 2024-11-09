let store = Immutable.Map ({
    user: Immutable.Map({ name: "Student" }),
    rover: 'Home',
    rovers: Immutable.List(['Home', 'Curiosity', 'Opportunity', 'Spirit'])
});

// add our markup to the page
const root = document.querySelector('main');

const imageHtml = (apod) => {
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
};

const getHomeContent = () => {
     getImageOfToday().then( apod => root.innerHTML = imageHtml(apod.apod) );
};

const makeActive = () => {
    const navLinks = document.querySelectorAll('.menu__link');
    navLinks.forEach(link => {
        if(link.parentElement.id === store.get('rover')) {
            link.classList.add('active__link');
        } else {
            link.classList.remove('active__link');
        }
    });
}

const getRoverContent = (rover) => {
    rover = rover.latest_photos;
    const launchDate = rover[0].rover.launch_date;
    const landDate = rover[0].rover.landing_date;
    const status = rover[0].rover.status; 
    const photos = rover.map( img => ({imageSrc: img.img_src, earthDay: img.earth_date}) );
    const imgHtml = photos.map( img => `<figure>
            <figcaption>${img.earthDay}</figcaption>
            <img src = "${img.imageSrc}" alt = "Image link: ${img.imageSrc}" height="350px" width="100%">
        <figure>`
    );

    root.innerHTML = `<p>Launch date: ${launchDate} | Land date: ${landDate} | Status: ${status}</p>`;
    const container = document.createElement('div');
    container.classList.add('container');
    imgHtml.forEach(img => container.innerHTML += img);
    root.appendChild(container);
}

showSelectedRover = () => {
    makeActive();
    if(store.get('rover') === 'Home') {
       getHomeContent();
    } else {
        getImagesForRover(store.get('rover').toLowerCase())
        .then(
            rover => { 
                getRoverContent(rover);
                return rover;
            }
        )
    }
};

const selectRover = (event) => {
    event.preventDefault();
    const target = event.target.parentElement;
    if (target.nodeName === 'LI') {
        const newState = store.set('rover', target.id);
        updateStore(store, newState);
    }
}

const buildNav = () => {
    const ul = document.querySelector('#navbar__list');

    Array.from(store.get('rovers')).forEach((rover, i) => {
        const li = document.createElement('li'); 
        li.classList.add('navbar__menu'); 
        li.setAttribute('id', rover);
        const menuLink = document.createElement('a'); 
        menuLink.classList.add('navbar__menu', 'menu__link'); 
        menuLink.innerText = rover;
        i === 0 ? menuLink.classList.add("active__link") : "";
        li.appendChild(menuLink);
        ul.append(li);
    });

    ul.addEventListener('click', selectRover);
};

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    showSelectedRover();
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    buildNav();
    render(root, store)
})

// ------------------------------------------------------  API CALLS

const getImageOfToday = async () => {
    return fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => {return {apod};})
        .catch(err => console.log(`getImageOfToday Error: ${err}`));
}

const getImagesForRover = async (id) => {
    const response = await fetch(`http://localhost:3000/rovers/${id}`);
    currentRover = await response.json();
    return currentRover;
}