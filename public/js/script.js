// script.js
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/users/dashboard') // Cambia a esta ruta
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
                    <td>${user.pago ? 'Sí' : 'No'}</td>
                `;
                userTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error al cargar los usuarios:', error));
});
