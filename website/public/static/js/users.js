// Redirect to create user page on create user button click
window.addEventListener('load', () => {
    document.querySelector('#createUser').addEventListener('click', () => {
        window.location.href = '/admin/users/create';
    });
});