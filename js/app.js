function iniciarApp() {

    const resultado = document.querySelector('#resultado');

    const selectCategorias = document.querySelector('#categorias');

    if (selectCategorias) {
        selectCategorias.addEventListener('change', seleccionarCategoria)

        obtenerCategorias();
    }

    const favoritosDiv = document.querySelector('.favoritos');
    if (favoritosDiv) {
        obtenerFavoritos();
    }

    const modal = new bootstrap.Modal('#modal', {})



    function obtenerCategorias() {

        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'

        fetch(url) //llamado para una url, entonces que? quiero una respuesta, quiero imprimir resultados
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarCategorias(resultado.categories))

    }

    function mostrarCategorias(categorias = []) {
        categorias.forEach(categoria => {
            const option = document.createElement('OPTION');//Cuando se trabaja con create element, se reomienda colocar todo en mayuscula
            option.value = categoria.strCategory
            option.textContent = categoria.strCategory;
            selectCategorias.appendChild(option)

        })

    }

    function seleccionarCategoria(e) {
        console.log(e.target.value)//Con esto se puede leer el contenido cuando es disparado por un evento.

        const categoria = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;

        fetch(url)
            .then(respuesta => respuesta.json()) //respuesta
            .then(resultado => mostrarRecetas(resultado.meals))//resultado

    }

    function mostrarRecetas(recetas = []) {

        limpiarHtml(resultado)

        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = recetas.length ? 'Resultado' : 'No Hay Resultados';
        resultado.appendChild(heading) ///Comprobar si hay resultados
            ;
        //Iterar en los resultados
        recetas.forEach(receta => {
            const { idMeal, strMeal, strMealThumb } = receta;

            const recetaContenedor = document.createElement('DIV');
            recetaContenedor.classList.add('col-md-4');

            const recetaCard = document.createElement('DIV');
            recetaCard.classList.add('card', 'mb-4');

            const recetaImagen = document.createElement('IMG');
            recetaImagen.classList.add('card-img-top');
            recetaImagen.Alt = `Imagen de la receta ${strMeal ?? receta.titulo}`;
            recetaImagen.src = strMealThumb ?? receta.img;

            const recetaCardBody = document.createElement('DIV');
            recetaCardBody.classList.add('card-Body');

            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal ?? receta.titulo;

            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn', 'btn-danger', 'w-100');
            recetaButton.textContent = 'Ver Receta';
            /* recetaButton.dataset.bsTarget = "#modal";
             recetaButton.dataset.bsToggle = "modal";*/
            recetaButton.onclick = function () {
                seleccionarReceta(idMeal ?? receta.id)
            } //con una callBack se espera que se realice el evento y luego tenemos el resultado

            //Inyectar en el codigo HTML

            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard);

            resultado.appendChild(recetaContenedor);

        })
    }

    function seleccionarReceta(id) {
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetaModal(resultado.meals[0]))
    }

    function mostrarRecetaModal(receta) {

        const { idMeal, strInstructions, strMeal, strMealThumb } = receta;

        // Añadir contenido al modal
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
                <img class="img-fluid" src="${strMealThumb}" = alt="receta ${strMeal}" />
                <h3 class="my-3">Instrucciones </h3>
                <p>${strInstructions}</p>
                <h3 class="my-3">Ingredientes y Cantidades </h3>
            `;

        const listGroup = document.createElement('UL');
        listGroup.classList.add('List-group');
        //Mostrar cantidades e ingredientes
        for (let i = 1; i <= 20; i++) {
            if (receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredienteLi = document.createElement('LI');
                ingredienteLi.classList.add('list/group-item');
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`

                listGroup.appendChild(ingredienteLi);
            }

        }

        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer');

        limpiarHtml(modalFooter);

        //Botones de cerrar y favorito
        const btnFavorito = document.createElement('BUTTON');
        btnFavorito.classList.add('btn', 'btn-danger', 'col');
        btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar Favorito' : 'Guardar Favorito';

        //localStorage
        btnFavorito.onclick = function () {

            if (existeStorage(idMeal)) {
                eliminarFavorito(idMeal)
                btnFavorito.textContent = 'Guardar Favorito';
                MostrarToast('Eliminado Correctamente')
                return;
            }

            agregarFavorito({

                id: idMeal,
                title: strMeal,
                img: strMealThumb
            });
            btnFavorito.textContent = 'Eliminar Favorito';
            MostrarToast('Agregado Correctamente')
        }

        const btnCerrarModal = document.createElement('BUTTON');
        btnCerrarModal.classList.add('btn', 'btn-secondary', 'col');
        btnCerrarModal.textContent = 'Cerrar';
        btnCerrarModal.onclick = function () {
            modal.hide();//Se utiliza callBack para esperar que ocurra el evento onCLick
        }

        modalFooter.appendChild(btnFavorito);
        modalFooter.appendChild(btnCerrarModal);

        // muestra el modal
        modal.show();
    }

    function agregarFavorito(receta) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []; //??(Sino Existe , entonces que agregue un arreglo)(Si del lado izquierdo marca null, entonces puede usar el lado derecho)
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]))//Tomamos una copia de favoritos y luego pasamos la receta
    }

    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id)//De esta forma se va a traer todos los ID diferentes a los q le estamos pasando.
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
    }

    function existeStorage(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []; //Some retorna un true con que logre encontrar uno.
        return favoritos.some(favorito => favorito.id === id);
    }

    function MostrarToast(mensaje) {
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        toastBody.textContent = mensaje
        const toast = new bootstrap.Toast(toastDiv);

        toast.show()
    }

    function obtenerFavoritos() {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];

        if (favoritos.length) {

            mostrarRecetas(favoritos);

            return
        }

        const noFavoritos = document.createElement('P');
        noFavoritos.textContent = 'No Hay Favoritos';
        noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
        favoritosDiv.appendChild(noFavoritos);
    }

    function limpiarHtml(selector) {
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild) //

        }
    }
}

document.addEventListener('DOMContentLoaded', iniciarApp);






