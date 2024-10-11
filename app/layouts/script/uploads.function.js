function formatFileSize(bytes) {
   if (bytes < 1024) {
      return bytes + ' B';
   } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
   } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
   } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
   }
}

async function deleteUploadedFile(filename) {
   try {
      const response = await fetch(
         'http://192.168.1.156:8000/api/files/' + filename,
         // 'http://192.168.0.249:8000/api/files/' + filename,
         { method: 'DELETE'}
      );
      if (response.ok) {
         alert('File deleted successfully');
      } else {
         alert('Error deleting file: ' + response.statusText);
      }
   } catch (error) {
      console.error('Error deleting file:', error);
   }
}

// async function renameUploadedFile(oldName, newName) {
//    try {
//       const response = await fetch('http://192.168.1.156:8000/api/files/' + oldName, {
//          method: 'PATCH',
//          headers: {
//             'Content-Type': 'application/json'
//          },
//          body: JSON.stringify({ new_name: newName })
//       });
//       if (response.ok) {
//          alert('File renamed successfully');
//          fetchUploadedFiles();
//       } else {
//          alert('Error renaming file: ' + response.statusText);
//       }
//    } catch (error) {
//       console.error('Error renaming file:', error);
//    }
// }

async function fetchUploadedFiles() {
   try {
      const response = await fetch('http://192.168.1.156:8000/api/files/');
      // const response = await fetch('http://192.168.0.249:8000/api/files/');
      const data = await response.json();
      const fileList = document.getElementById('fileList');
      fileList.innerHTML = '';

      if (data.files && data.files.length > 0) {
         data.files.forEach(file => {
            const listItem = document.createElement('li');
            listItem.innerHTML = file.filename + ' ' + '(' + formatFileSize(file.size) + ')' + ' - Last modified: ' + new Date(file.last_modified).toLocaleString();

            // Botón de eliminar archivo
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = 'Delete';
            deleteButton.classList.add('delete-button'); // Clase para estilos
            deleteButton.onclick = async function() {
               await deleteUploadedFile(file.filename);
               fetchUploadedFiles(); // Refresca la lista después de borrar
            };

            // Botón de renombrar archivo
            // const renameButton = document.createElement('button');
            // renameButton.innerHTML = 'Rename';
            // renameButton.classList.add('rename-button'); // Clase para estilos
            // renameButton.onclick = function() {
            //    const newName = prompt('Enter new filename:', file.filename);
            //    if (newName && newName !== file.filename) {
            //       renameUploadedFile(file.filename, newName);
            //    }
            // };

            listItem.appendChild(deleteButton);
            // listItem.appendChild(renameButton);
            fileList.appendChild(listItem);
         });
      } else {
         const listItem = document.createElement('li');
         listItem.textContent = 'No files uploaded yet';
         fileList.appendChild(listItem);
      }
   } catch (error) {
      console.error('Error fetching files:', error);
   }
}

// Llamar a la función para obtener archivos cuando cargue la página
window.onload = fetchUploadedFiles;