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

function showMessage(message, type = 'success') {
   const messageBox = document.createElement('div');
   messageBox.className = `message-box ${type}`;
   messageBox.textContent = message;
   
   document.body.appendChild(messageBox);
   
   setTimeout(() => {
      messageBox.remove();
   }, 3000); // Desaparece en 3 segundos
}

async function deleteUploadedFile(filename) {
   try {
      const response = await fetch(
         'http://localhost:8000/api/files/' + filename, { method: 'DELETE'}
         // 'http://192.168.1.156:8000/api/files/' + filename, { method: 'DELETE'}
      );
      if (response.ok) {
         showMessage('File deleted succesfully', 'success');
      } else {
         showMessage('Error deleting file: ' + response.statusText, 'error');
      }
   } catch (error) {
      console.error('Error deleting file:', error);
   }
}

async function fetchUploadedFiles() {
   try {
      const response = await fetch('http://localhost:8000/api/files/');
      // const response = await fetch('http://192.168.1.156:8000/api/files/')
      const data = await response.json();
      const fileList = document.getElementById('fileList');
      fileList.innerHTML = '';

      if (data.files && data.files.length > 0) {
         data.files.forEach(file => {
            const listItem = document.createElement('li');
            
            // Basic information: Name, size and last modification.
            listItem.innerHTML = file.filename + ' ' + '(' + formatFileSize(file.size) + ')';

            // Get file details if exists.
            if (file.video_streams || file.audio_streams || file.subtitle_streams) {
               const detailsList = document.createElement('ul');
               
               // Video stream information.
               if (file.video_streams && file.video_streams.length > 0) {
                  file.video_streams.forEach((video, index) => {
                     const videoItem = document.createElement('li');
                     videoItem.innerHTML = `Video Stream ${index + 1}: ${video.codec.toUpperCase()}, Resolution: ${video.resolution}, FPS: ${video.fps}`;
                     detailsList.appendChild(videoItem);
                  });
               }

               // Audio stream information.
               if (file.audio_streams && file.audio_streams.length > 0) {
                  file.audio_streams.forEach((audio, index) => {
                     const audioItem = document.createElement('li');
                     audioItem.innerHTML = `Audio Stream ${index + 1}: ${audio.codec.toUpperCase()}, Language: ${audio.language.toUpperCase()}`;
                     detailsList.appendChild(audioItem);
                  });
               }

               // Subtitle stream information.
               if (file.subtitle_streams && file.subtitle_streams.length > 0) {
                  file.subtitle_streams.forEach((subtitle, index) => {
                     const subtitleItem = document.createElement('li');
                     subtitleItem.innerHTML = `Subtitle Stream ${index + 1}: ${subtitle.codec}, Language: ${subtitle.language}`;
                     detailsList.appendChild(subtitleItem);
                  });
               }

               listItem.appendChild(detailsList);
            }

            // Delete button.
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = 'Delete';
            deleteButton.classList.add('delete-button'); // delete-button class
            deleteButton.onclick = async function() {
               if (confirm(`Are you sure you want to delete ${file.filename}?`)) {
                  await deleteUploadedFile(file.filename);
                  fetchUploadedFiles(); // Refresca la lista tras borrar
               }
            };

            listItem.appendChild(deleteButton);
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

// Call function on load
window.onload = fetchUploadedFiles;