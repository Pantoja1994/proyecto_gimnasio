// Cargar los usuarios al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/users/dashboard/users') // Llama a la ruta del servidor
        .then(response => response.json())
        .then(data => {
            const userTableBody = document.getElementById('user-table-body');
            data.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.nombre}</td>
                    <td>${user.edad}</td>
                    <td>${user.genero}</td>
                    <td>${user.peso}</td>
                    <td>${user.altura}</td>
                    <td>${user.diasActividad}</td>
                    <td>${user.tipoActividad}</td>
                    <td>${user.objetivo}</td>
                    <td>${user.telefono}</td>
                    <td>${user.retoSeleccionado || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${user.id})">Eliminar</button>
                    </td>
                `;
                userTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error al cargar los usuarios:', error));
});

// Obtener el token y mostrar el mensaje de bienvenida
document.addEventListener('DOMContentLoaded', () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
    const decoded = jwt_decode(token);

    const welcomeMessage = document.getElementById('user-name');
    welcomeMessage.textContent = `Bienvenido, ${decoded.nombre_completo}`;

    // Cargar los usuarios en cards
    cargarUsuariosEnCards();
});

// Función para eliminar un usuario
function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    fetch(`/api/users/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message);
        location.reload(); // Recarga la página para actualizar la lista de usuarios
    })
    .catch(error => console.error('Error al eliminar usuario:', error));
}

let usuariosCargados = false; // Bandera para verificar si ya están cargados

// Mostrar y cargar fotos en cards
function cargarUsuariosEnCards() {
    if (usuariosCargados) return; // Evita la recarga si ya están cargados

    const isModoOscuro = document.body.classList.contains('modo-oscuro'); // Verifica si el modo oscuro está activado

    fetch('/api/users/cards')  // Asegúrate de que esta ruta devuelva los datos correctamente.
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('cards-container');
            container.innerHTML = ''; // Limpia el contenedor para refrescar las cards

            data.forEach(user => {
                const timestamp = new Date().getTime(); // Evita el caché de la imagen

                const card = document.createElement('div');
                card.classList.add('card', 'mb-4', 'shadow');
                card.setAttribute('data-id', user.id); // Atributo para identificar la card en el DOM

                // Aplica el modo oscuro si está activo
                if (isModoOscuro) card.classList.add('modo-oscuro');

                // Asegúrate de usar las rutas exactas desde la base de datos
                const fotoAntes = user.foto_antes ? `${user.foto_antes}?t=${timestamp}` : 'images/placeholder.jpg';
                const fotoDespues = user.foto_despues ? `${user.foto_despues}?t=${timestamp}` : 'images/placeholder.jpg';

                card.innerHTML = `
                    <div class="photo-container">
                        <img src="${fotoAntes}" alt="Foto Antes" class="user-photo" 
                             onclick="showModal('${fotoAntes}', 'Foto Antes')">
                        <img src="${fotoDespues}" alt="Foto Después" class="user-photo" 
                             onclick="showModal('${fotoDespues}', 'Foto Después')">
                    </div>
                    <div class="card-body">
                        <p><strong>Nombre:</strong> ${user.nombre}</p>
                        <p><strong>Edad:</strong> ${user.edad}</p>
                        <p><strong>Género:</strong> ${user.genero}</p>
                        <p><strong>Peso:</strong> ${user.peso} kg</p>
                        <p><strong>Altura:</strong> ${user.altura} cm</p>
                        <p><strong>Objetivo:</strong> ${user.objetivo}</p>
                        <p><strong>Reto Seleccionado:</strong> ${user.retoSeleccionado}</p>
                        <p class="upload-text" onclick="mostrarCamposSubida(${user.id})">Editar</p>
                        <div id="upload-fields-${user.id}" class="upload-fields" style="display: none;">
                            <label for="fotoAntes-${user.id}">Foto del Antes</label>
                            <input type="file" accept="image/*" class="upload-button" id="fotoAntes-${user.id}">
                            
                            <label for="fotoDespues-${user.id}">Foto del Después</label>
                            <input type="file" accept="image/*" class="upload-button" id="fotoDespues-${user.id}">
                            
                            <div class="button-group">
                                <button class="upload-confirm" onclick="subirFotos(${user.id})">Guardar Cambios</button>
                                <button class="cancel-upload" onclick="cancelarSubida(${user.id})">Cancelar</button>
                                <button class="btn btn-danger btn-sm mt-2" onclick="eliminarUsuario(${user.id})">Eliminar</button>
                            </div>
                        </div>
                    </div>
                `;
                
                container.appendChild(card);
            });
            usuariosCargados = true; // Marca como cargados para evitar recargas adicionales
        })
        .catch(error => console.error('Error al cargar los usuarios:', error));
}


function eliminarUsuarioCard(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    fetch(`/api/users/eliminar/${id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            usuariosCargados = false; // Desactiva la bandera para recargar todas las cards
            cargarUsuariosEnCards(); // Recarga todas las cards para reflejar la eliminación
        })
        .catch(error => console.error('Error al eliminar usuario:', error));
}



function previsualizarFoto(userId, tipo) {
    const input = document.getElementById(`foto${tipo === 'antes' ? 'Antes' : 'Despues'}-${userId}`);
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const imgElement = document.querySelector(`#upload-fields-${userId} .user-photo.${tipo}`);
        imgElement.src = e.target.result;
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}

function mostrarCamposSubida(userId) {
    const uploadFields = document.getElementById(`upload-fields-${userId}`);
    uploadFields.style.display = uploadFields.style.display === 'none' ? 'block' : 'none';
}
//hASTA AQI JALA: 1234
function subirFotos(userId) {
    const fotoAntesInput = document.getElementById(`fotoAntes-${userId}`);
    const fotoDespuesInput = document.getElementById(`fotoDespues-${userId}`);
    const fotoAntesFile = fotoAntesInput.files[0];
    const fotoDespuesFile = fotoDespuesInput.files[0];

    const formData = new FormData();
    if (fotoAntesFile) formData.append('fotoAntes', fotoAntesFile);
    if (fotoDespuesFile) formData.append('fotoDespues', fotoDespuesFile);

    fetch(`/api/users/${userId}/upload`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.message) {
            alert(result.message);
            usuariosCargados = false; // Desactiva la bandera para forzar la recarga
            cargarUsuariosEnCards(); // Recarga las cards para reflejar las nuevas fotos
        } else if (result.error) {
            alert(result.error);
        }
    })
    .catch(error => console.error('Error al subir las fotos:', error));
}


function showModal(imageSrc, altText) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const captionText = document.getElementById("caption");

    modal.style.display = "block";
    modalImg.src = imageSrc;
    captionText.innerHTML = altText;

    // Ajusta la imagen para que se adapte al contenedor
    modalImg.style.width = "auto";
    modalImg.style.height = "auto";
}

function closeModal() {
    const modal = document.getElementById("imageModal");
    modal.style.display = "none";
}

// Cierra el modal cuando se hace clic fuera de la imagen
document.getElementById("imageModal").addEventListener("click", function(event) {
    const modalImg = document.getElementById("modalImage");
    if (event.target !== modalImg) {
        closeModal();
    }
});

function cancelarSubida(userId) {
    // Oculta los campos de carga de fotos
    const uploadFields = document.getElementById(`upload-fields-${userId}`);
    if (uploadFields) {
        uploadFields.style.display = 'none';
    }

    // Limpia los archivos seleccionados en los campos de carga
    const fotoAntesInput = document.getElementById(`fotoAntes-${userId}`);
    const fotoDespuesInput = document.getElementById(`fotoDespues-${userId}`);
    
    if (fotoAntesInput) {
        fotoAntesInput.value = '';
    }
    if (fotoDespuesInput) {
        fotoDespuesInput.value = '';
    }
}

//SECCION DE CONFIGURACION
function mostrarFormularioCrearUsuario() {
    document.getElementById('formulario-crear-usuario').style.display = 'block';
    document.getElementById('titulo-formulario-usuario').textContent = 'Crear Nuevo Usuario';
}

function cancelarFormularioUsuario() {
    document.getElementById('form-crear-usuario').reset();
    document.getElementById('formulario-crear-usuario').style.display = 'none';
}

document.getElementById('form-crear-usuario').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        nombre_completo: document.getElementById('nombre_completo').value,
        rol: document.getElementById('rol').value
    };

    try {
        const response = await fetch('/api/admin-users/crear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Usuario creado exitosamente');
            cancelarFormularioUsuario(); // Cierra el formulario
            cargarUsuariosSistemaEnCards(); // Recarga la lista de usuarios en formato de cards
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error al crear usuario:', error);
    }
});




document.addEventListener('DOMContentLoaded', () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
    const decoded = jwt_decode(token);

    if (decoded.rol === 'administrador') {
        // Mostrar la opción de Configuración solo para administradores
        document.getElementById('configuracion-menu').style.display = 'block';
    } else {
        // Ocultar la opción de Configuración para otros roles
        document.getElementById('configuracion-menu').style.display = 'none';
    }
});


// Función para cargar los usuarios del sistema en formato de cards
function cargarUsuariosSistemaEnCards() {
    fetch('/api/admin-users/listar')  // Ruta para obtener los usuarios del sistema
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('usuarios-cards-container');
            container.innerHTML = ''; // Limpia el contenedor para refrescar las cards

            data.forEach(user => {
                const card = document.createElement('div');
                card.classList.add('card', 'mb-4', 'shadow');

                card.innerHTML = `
                    <div class="card-body">
                        <p><strong>Username:</strong> ${user.username}</p>
                        <p><strong>Nombre Completo:</strong> ${user.nombre_completo}</p>
                        <p><strong>Rol:</strong> ${user.rol}</p>
                        <div class="button-group">
                            <button class="btn btn-warning btn-sm" onclick="editarUsuarioSistema(${user.id})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarUsuarioSistema(${user.id})">Eliminar</button>
                        </div>
                    </div>
                `;
                
                container.appendChild(card);
            });
        })
        .catch(error => console.error('Error al cargar los usuarios del sistema:', error));
}

// Función para editar usuario del sistema
function editarUsuarioSistema(id) {
    fetch(`/api/admin-users/actualizar/${id}`)
        .then(response => response.json())
        .then(user => {
            // Rellenar el formulario con los datos del usuario
            document.getElementById('username').value = user.username;
            document.getElementById('nombre_completo').value = user.nombre_completo;
            document.getElementById('rol').value = user.rol;
            mostrarFormularioCrearUsuario(); // Mostrar el formulario para editar
        })
        .catch(error => console.error('Error al obtener datos del usuario:', error));
}

// Función para eliminar usuario del sistema
function eliminarUsuarioSistema(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario del sistema?')) return;

    fetch(`/api/admin-users/eliminar/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message);
        cargarUsuariosSistemaEnCards(); // Recarga las cards después de eliminar el usuario
    })
    .catch(error => console.error('Error al eliminar usuario del sistema:', error));
}



//SECCION DE CONFIGURACION FIN

//SECCION DE ESTADISTICAS
document.getElementById('aplicarFiltrosBtn').addEventListener('click', async () => {
    try {
        const edadMinima = document.getElementById('edad-minima').value;
        const edadMaxima = document.getElementById('edad-maxima').value;
        const genero = document.getElementById('genero').value;
        const cursoId = document.getElementById('tipo-reto').value;

        const response = await fetch(`/api/estadisticas/filtrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tipoReto: cursoId,
                edadMinima: parseInt(edadMinima, 10),
                edadMaxima: parseInt(edadMaxima, 10),
                genero: genero || null
            })
        });

        const data = await response.json();

        // Verificar los datos recibidos
        console.log("Datos recibidos:", data);

        if (response.ok) {
            mostrarDatosEstadisticas(data.inscripciones);
            mostrarGraficoEstadisticas(data.inscripciones);
            mostrarGraficoEdad(data.edades);
            mostrarGraficoGenero(data.generoDistribucion);
        } else {
            console.error('Error al obtener datos de las estadísticas:', data.message);
            document.getElementById('estadisticas-resultados').innerHTML = 'Error al obtener los datos.';
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
        document.getElementById('estadisticas-resultados').innerHTML = 'Error en la solicitud.';
    }
});



function mostrarDatosEstadisticas(datos) {
    const contenedor = document.getElementById('estadisticas-resultados');
    contenedor.innerHTML = '';

    // Obtener valores de los filtros aplicados
    const edadMinima = document.getElementById('edad-minima').value || "Sin filtro";
    const edadMaxima = document.getElementById('edad-maxima').value || "Sin filtro";
    const genero = document.getElementById('genero').value || "Todos";

    // Crear una sección para mostrar los filtros aplicados en una sola línea
    let filtrosAplicados = `
        <div class="filtros-aplicados bg-light p-2 mb-3 rounded d-flex flex-wrap align-items-center">
            <strong class="text-primary mr-2">Filtros aplicados:</strong>
            <span class="mr-3">Edad mínima: <b>${edadMinima}</b></span>
            <span class="mr-3">Edad máxima: <b>${edadMaxima}</b></span>
            <span class="mr-3">Género: <b>${genero}</b></span>
        </div>
    `;

    // Mostrar los filtros antes de la tabla
    contenedor.innerHTML = filtrosAplicados;

    if (datos && datos.length > 0) {
        // Crear la tabla
        let htmlContent = `
            <table class="table table-striped table-bordered mt-3">
                <thead>
                    <tr>
                        <th>Curso</th>
                        <th>Total Inscripciones</th>
                    </tr>
                </thead>
                <tbody>`;

        datos.forEach(item => {
            htmlContent += `
                <tr>
                    <td>${item.curso}</td>
                    <td>${item.total}</td>
                </tr>`;
        });

        htmlContent += `</tbody></table>`;

        // Añadir la tabla después de los filtros aplicados
        contenedor.innerHTML += htmlContent;
    } else {
        contenedor.innerHTML += '<p>No se encontraron inscripciones para los filtros seleccionados.</p>';
    }
}

function cargarDropdownCursos() {
    fetch('/api/cursos/obtener')
        .then(response => response.json())
        .then(data => {
            const dropdown = document.getElementById('tipo-reto'); // ID del dropdown de tipo de reto
            dropdown.innerHTML = '<option value="">Todos</option>'; // Opción inicial para ver todos

            data.forEach(curso => {
                const option = document.createElement('option');
                option.value = curso.id;
                option.textContent = curso.nombre;
                dropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error al cargar cursos en el dropdown:', error));
}

// Llama a esta función cuando cargue la página o al cargar la sección de estadísticas
document.addEventListener('DOMContentLoaded', cargarDropdownCursos);

document.getElementById('descargarReporteCsvBtn').addEventListener('click', async () => {
    const edadMinima = document.getElementById('edad-minima').value;
    const edadMaxima = document.getElementById('edad-maxima').value;
    const genero = document.getElementById('genero').value;
    const cursoId = document.getElementById('tipo-reto').value;

    try {
        // Crear un formulario para enviar la solicitud POST
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/api/estadisticas/reporte-csv';
        form.style.display = 'none';

        // Agregar los filtros como campos ocultos
        form.innerHTML = `
            <input type="hidden" name="tipoReto" value="${cursoId}">
            <input type="hidden" name="edadMinima" value="${edadMinima}">
            <input type="hidden" name="edadMaxima" value="${edadMaxima}">
            <input type="hidden" name="genero" value="${genero}">
        `;

        document.body.appendChild(form);
        form.submit(); // Enviar el formulario para descargar el CSV
        document.body.removeChild(form); // Eliminar el formulario después de enviarlo
    } catch (error) {
        console.error('Error al descargar el reporte en CSV:', error);
    }
});
// Función para mostrar el gráfico de Total de Inscripciones
function mostrarGraficoEstadisticas(datos) {
    const ctx = document.getElementById('estadisticasChart').getContext('2d');
    if (window.myChart) window.myChart.destroy();

    const nombresCursos = datos.map(item => item.curso);
    const totalInscripciones = datos.map(item => item.total);

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nombresCursos,
            datasets: [{
                label: 'Total Inscripciones',
                data: totalInscripciones,
                backgroundColor: 'rgba(78, 115, 223, 0.5)',
                borderColor: 'rgba(78, 115, 223, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Función para mostrar el gráfico de Edad Promedio por curso
function mostrarGraficoEdad(edades) {
    const ctx = document.getElementById('edadChart').getContext('2d');

    if (window.myEdadChart) {
        window.myEdadChart.destroy();
    }

    const nombresCursos = edades.map(item => item.curso);
    const edadPromedio = edades.map(item => parseFloat(item.edad_promedio));

    window.myEdadChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nombresCursos,
            datasets: [{
                label: 'Edad Promedio',
                data: edadPromedio,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Función para mostrar el gráfico de GENERO Promedio por curso
function mostrarGraficoGenero(generoDistribucion) {
    const ctx = document.getElementById('generoChart').getContext('2d');

    // Si existe un gráfico previo, destrúyelo antes de crear uno nuevo
    if (window.myGeneroChart) {
        window.myGeneroChart.destroy();
    }

    // Sumar los datos de género independientemente del curso
    let totalMasculino = 0;
    let totalFemenino = 0;

    generoDistribucion.forEach(item => {
        if (item.genero === 'masculino') {
            totalMasculino += item.cantidad;
        } else if (item.genero === 'femenino') {
            totalFemenino += item.cantidad;
        }
    });

    // Preparar los datos para el gráfico
    const generos = ['masculino', 'femenino'];
    const cantidades = [totalMasculino, totalFemenino];
    const colores = ['#36A2EB', '#FF6384'];  // Rosa para masculino, azul para femenino

    // Crear el gráfico de género con colores consistentes
    window.myGeneroChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: generos,
            datasets: [{
                label: 'Género',
                data: cantidades,
                backgroundColor: colores,
                borderColor: colores,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

// Llama a mostrarGraficoEstadisticas con los datos obtenidos
document.getElementById('modoOscuroBtn').addEventListener('click', () => {
    document.body.classList.toggle('modo-oscuro');
    const button = document.getElementById('modoOscuroBtn');
    button.textContent = document.body.classList.contains('modo-oscuro') ? 'Modo Claro' : 'Modo Oscuro';

    // Aplica el modo oscuro a las cards generadas dinámicamente
    document.querySelectorAll('.card').forEach(card => {
        if (document.body.classList.contains('modo-oscuro')) {
            card.classList.add('modo-oscuro');
        } else {
            card.classList.remove('modo-oscuro');
        }
    });

    // Aplica el modo oscuro a otras secciones generadas dinámicamente
    document.querySelectorAll('.table, .container, .btn').forEach(elemento => {
        if (document.body.classList.contains('modo-oscuro')) {
            elemento.classList.add('modo-oscuro');
        } else {
            elemento.classList.remove('modo-oscuro');
        }
    });
});



//SECCION DE ESTADISTICAS FIN


let isEditing = false;

        document.addEventListener('DOMContentLoaded', () => {
            const cookieToken = document.cookie.split('; ').find(row => row.startsWith('token='));
            if (!cookieToken) {
                console.log("No se encontró el token en las cookies");
                return;
            }
    
            const token = cookieToken.split('=')[1];
            const user = jwt_decode(token);
            document.getElementById('user-name').textContent = user.nombre_completo;
        });

        window.addEventListener('scroll', () => {
            const irArribaBtn = document.getElementById('ir-arriba');
            if (window.scrollY > 100) { // Cambia el valor si quieres que aparezca antes o después
                irArribaBtn.style.display = 'block';
            } else {
                irArribaBtn.style.display = 'none';
            }
        });

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.getElementById('main-content');
            sidebar.classList.toggle('hidden');
            mainContent.classList.toggle('expanded');
        }

        document.addEventListener('DOMContentLoaded', () => {
            mostrarDashboard(); // Al cargar, muestra solo el dashboard
        });
        
        function mostrarDashboard() {
            document.getElementById('dashboard-section').style.display = 'block';
            document.getElementById('usuarios-section').style.display = 'none';
            document.getElementById('estadisticas-section').style.display = 'none';
            document.getElementById('cursos-section').style.display = 'none';
            document.getElementById('curso-formulario').style.display = 'none';
            document.getElementById('configuracion-section').style.display = 'none';
            setActiveMenu('dashboard-menu');
        }

        function mostrarEstadisticas() {
            document.getElementById('dashboard-section').style.display = 'none';
            document.getElementById('usuarios-section').style.display = 'none';
            document.getElementById('estadisticas-section').style.display = 'block';
            document.getElementById('cursos-section').style.display = 'none';
            document.getElementById('curso-formulario').style.display = 'none';
            document.getElementById('configuracion-section').style.display = 'none';
            setActiveMenu('estadisticas-menu');
        }

        function mostrarUsuarios() {
            document.getElementById('dashboard-section').style.display = 'none';
            document.getElementById('usuarios-section').style.display = 'block';
            document.getElementById('estadisticas-section').style.display = 'none';
            document.getElementById('cursos-section').style.display = 'none';
            document.getElementById('curso-formulario').style.display = 'none';
            document.getElementById('configuracion-section').style.display = 'none';
            setActiveMenu('usuarios-menu');
            cargarUsuariosEnCards();
        }

        function mostrarCursos() {
            document.getElementById('dashboard-section').style.display = 'none';
            document.getElementById('usuarios-section').style.display = 'none';
            document.getElementById('estadisticas-section').style.display = 'none';
            document.getElementById('cursos-section').style.display = 'block';
            document.getElementById('curso-formulario').style.display = 'none';
            document.getElementById('configuracion-section').style.display = 'none';
            setActiveMenu('cursos-menu');
            cargarCursosDashboard();
        }

        function mostrarConfiguracion() {
            document.getElementById('dashboard-section').style.display = 'none';
            document.getElementById('usuarios-section').style.display = 'none';
            document.getElementById('estadisticas-section').style.display = 'none';
            document.getElementById('cursos-section').style.display = 'none';
            document.getElementById('curso-formulario').style.display = 'none';
            document.getElementById('configuracion-section').style.display = 'block'; // Muestra configuración
            // Contenedorontenedor de las cards esté visible
            document.getElementById('usuarios-cards-section').style.display = 'block';
            // Llama a la nueva función para cargar usuarios del sistema en cards
            cargarUsuariosSistemaEnCards();

            setActiveMenu('configuracion-menu');
        }
        document.getElementById('configuracion-menu').addEventListener('click', mostrarConfiguracion);

        function setActiveMenu(menuId) {
            document.querySelectorAll('.menu-link').forEach(link => {
                link.classList.remove('active');
            });
            document.getElementById(menuId).classList.add('active');
        }

        async function cargarCursosDashboard() {
            try {
                const response = await fetch('/api/cursos/obtener');
                const cursos = await response.json();

                const cursosContainer = document.getElementById('cursos-cards-container');
                cursosContainer.innerHTML = '';

                cursos.forEach(curso => {
                    const cursoCard = document.createElement('div');
                    cursoCard.classList.add('col-md-4', 'mb-4');
                    cursoCard.innerHTML = `
                        <div class="card h-100 shadow">
                            <img src="${curso.imagen_url || '/images/default.jpg'}" class="card-img-top" alt="${curso.nombre}">
                            <div class="card-body">
                                <h5 class="card-title">${curso.nombre}</h5>
                                <p class="card-text">${curso.descripcion}</p>
                                <p><strong>Costo:</strong> $${curso.costo}</p>
                                <p><strong>Duración:</strong> ${curso.duracion}</p>
                                <div class="button-group d-flex justify-content-between mt-3">
                                    <button class="btn btn-info btn-sm me-1" onclick="verInscripciones(${curso.id})">Ver Inscripciones</button>
                                    <button class="btn btn-warning btn-sm me-1" onclick="editarCurso(${curso.id})">Editar</button>
                                    <button class="btn btn-danger btn-sm" onclick="eliminarCurso(${curso.id})">Eliminar</button>
                                </div>
                            </div>
                        </div>
                    `;
                    cursosContainer.appendChild(cursoCard);
                });
            } catch (error) {
                console.error('Error al cargar cursos:', error);
            }
        }


        function editarCurso(cursoId) {
            fetch(`/api/cursos/${cursoId}`)
                .then(response => response.json())
                .then(curso => {
                    document.getElementById('curso-id').value = curso.id;
                    document.getElementById('nombre').value = curso.nombre;
                    document.getElementById('descripcion').value = curso.descripcion;
                    document.getElementById('costo').value = curso.costo;
                    document.getElementById('duracion').value = curso.duracion;
                    isEditing = true;
                    document.getElementById('formulario-titulo').textContent = 'Modificar Curso';
                    mostrarFormularioCurso();
                })
                .catch(error => console.error('Error al cargar el curso:', error));
        }

        function mostrarFormularioCurso() {
            document.getElementById('cursos-section').style.display = 'none';
            document.getElementById('curso-formulario').style.display = 'block';
        }

        // Función para crear un curso
        async function crearCurso() {
            const formData = new FormData(document.getElementById('form-curso'));
            try {
                const response = await fetch('/api/cursos/crear', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                alert(result.message || 'Curso creado exitosamente');
                cargarCursosDashboard();
                cancelarFormularioCurso();
            } catch (error) {
                console.error('Error al crear curso:', error);
            }
        }


        // Función para actualizar un curso existente
        async function actualizarCurso() {
            const cursoId = document.getElementById('curso-id').value;
            const formData = new FormData(document.getElementById('form-curso'));
            try {
                const response = await fetch(`/api/cursos/${cursoId}`, {
                    method: 'PUT',
                    body: formData
                });
                const result = await response.json();
                alert(result.message || 'Curso actualizado exitosamente');
                cargarCursosDashboard();
                cancelarFormularioCurso();
            } catch (error) {
                console.error('Error al actualizar curso:', error);
            }
        }

        async function eliminarCurso(cursoId) {
            if (confirm("¿Estás seguro de que deseas eliminar este curso?")) {
                try {
                    const response = await fetch(`/api/cursos/${cursoId}`, { method: 'DELETE' });
                    const result = await response.json();
                    alert(result.message || 'Curso eliminado exitosamente');
                    cargarCursosDashboard();
                } catch (error) {
                    console.error('Error al eliminar el curso:', error);
                }
            }
        }

        async function verInscripciones(cursoId) {
            try {
                const response = await fetch(`/api/cursos/inscripciones/${cursoId}`);
                const inscripciones = await response.json();
                alert(`Inscripciones para el curso: \n` + inscripciones.map(i => `${i.nombre_persona} - ${i.telefono}`).join('\n'));
            } catch (error) {
                console.error('Error al cargar inscripciones:', error);
            }
        }

        function mostrarFormularioCurso() {
            // Oculta los cursos existentes y muestra el formulario
            document.getElementById('cursos-section').style.display = 'none';
            document.getElementById('curso-formulario').style.display = 'block';
        }

        function cancelarFormularioCurso() {
            isEditing = false;
            document.getElementById('form-curso').reset();
            document.getElementById('curso-id').value = '';
            document.getElementById('formulario-titulo').textContent = 'Registrar Nuevo Curso';
            document.getElementById('cursos-section').style.display = 'block';
            document.getElementById('curso-formulario').style.display = 'none';
        }

        // Cambia entre las funciones de crear o actualizar dependiendo de si curso-id tiene un valor
        document.getElementById('form-curso').addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isEditing) {
                await actualizarCurso();
            } else {
                await crearCurso();
            }
        });



        // Manejo del envío del formulario (creación o modificación)
        /*document.getElementById('form-curso-nuevo').addEventListener('submit', async (e) => {
            e.preventDefault();

            // Obtén el valor del ID del curso del formulario para saber si es creación o edición
            const cursoId = document.getElementById('curso-id').value.trim();

            // Si el campo curso-id está vacío, asumimos que es un nuevo curso
            const isEditing = !!cursoId; // Si hay un ID, estamos editando

            // Configura la URL y el método según la acción
            const url = isEditing ? `/api/cursos/${cursoId}` : '/api/cursos/crear';
            const method = isEditing ? 'PUT' : 'POST';
            const formData = new FormData(e.target);

            // Desactiva el botón de envío para evitar duplicados
            const submitButton = e.target.querySelector('button[type="submit"]');
            submitButton.disabled = true;

            try {
                const response = await fetch(url, { method, body: formData });
                const result = await response.json();

                // Alerta personalizada según la acción
                if (isEditing) {
                    alert(result.message || 'Curso actualizado exitosamente');
                } else {
                    alert(result.message || 'Curso creado exitosamente');
                }

                // Recarga la lista de cursos y regresa a la vista de las cards
                await cargarCursosDashboard();
                cancelarFormularioCurso(); // Oculta el formulario y muestra las cards
            } catch (error) {
                console.error('Error al guardar el curso:', error);
            } finally {
                submitButton.disabled = false; // Reactiva el botón después de completar la operación
            }
        });*/





        async function verInscripciones(cursoId) {
            try {
                // Oculta los cursos y muestra la sección de inscripciones
                document.getElementById('cursos-section').style.display = 'none';
                document.getElementById('inscripciones-section').style.display = 'block';

                const response = await fetch(`/api/cursos/inscripciones/${cursoId}`);
                const inscripciones = await response.json();

                // Limpia el contenido previo de la tabla
                const inscripcionesTableBody = document.getElementById('inscripciones-table-body');
                inscripcionesTableBody.innerHTML = '';

                // Agrega las filas de la tabla con los datos de las inscripciones
                inscripciones.forEach(inscripcion => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${inscripcion.nombre_persona}</td>
                        <td>${inscripcion.telefono}</td>
                        <td>${inscripcion.correo_electronico}</td>
                        <td>${new Date(inscripcion.fecha_inscripcion).toLocaleDateString()}</td>
                    `;
                    inscripcionesTableBody.appendChild(row);
                });
            } catch (error) {
                console.error('Error al cargar inscripciones:', error);
            }
        }

        function regresarACursos() {
            // Oculta la sección de inscripciones y muestra los cursos
            document.getElementById('inscripciones-section').style.display = 'none';
            document.getElementById('cursos-section').style.display = 'block';
        }

