Dropzone.autoDiscover = false;
let myDropzone = new Dropzone("#dropzone", { 
    paramName: 'file_uploads',
    maxFilesize: 18432, // Allow files up to 18 Gib
    acceptedFiles: '.ts, .mp4, .mkv',
    addRemoveLinks: true,
    dictRemoveFile: 'DELETE',
    clickable: "#dropbutton",
    maxFiles: 6
    }
);

myDropzone.on("success", function(file, response) {
    console.log('File uploaded successfully:', file.name);
    // Llamar a la función para actualizar la lista de archivos
    fetchUploadedFiles();
});

myDropzone.on("error", function(file, errorMessage) {
    alert("File " + file.name + " is too large or failed to upload!");
});
// document.addEventListener("DOMContentLoaded", function() {
//     // Inicialización de Dropzone
//     Dropzone.autoDiscover = false; // Necesario para evitar que Dropzone se autodetecte

//     var myDropzone = new Dropzone("#dropzone", {
//         url: "http://192.168.0.249:8000/api/uploads/", // URL de tu API
//         method: "post", // Método de la solicitud
//         paramName: "file", // Nombre del parámetro del archivo
//         maxFilesize: 1000, // Tamaño máximo de archivo en MB
//         addRemoveLinks: true, // Permite eliminar archivos
//         dictRemoveFile: "Eliminar archivo", // Texto para el botón de eliminar
//         timeout: 1800000, // 30 minutos para la carga
//         init: function() {
//             this.on("success", function(file, response) {
//                 console.log("Archivo subido con éxito:", response);
//             });

//             this.on("error", function(file, errorMessage) {
//                 console.error("Error en la subida:", errorMessage);
//             });

//             this.on("sending", function(file, xhr, formData) {
//                 console.log("Enviando archivo:", file.name);
//             });

//             this.on("removedfile", function(file) {
//                 console.log("Archivo eliminado:", file.name);
//                 // Aquí podrías agregar una petición a tu backend para eliminar el archivo del servidor si es necesario
//             });

//             this.on("canceled", function(file) {
//                 console.log("Subida cancelada para el archivo:", file.name);
//             });
//         },
//         autoProcessQueue: true // Proceso automático de la cola de subida
//     });

//     // Opción para cancelar todas las subidas pendientes
//     var cancelButton = document.createElement("button");
//     cancelButton.innerText = "Cancelar todas las subidas";
//     cancelButton.onclick = function() {
//         myDropzone.removeAllFiles(true); // Esto cancelará y eliminará todos los archivos pendientes de la cola
//     };
//     document.body.appendChild(cancelButton);
// });