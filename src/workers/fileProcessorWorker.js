self.onmessage = async (e) => {
  const file = e.data.file;
  const chunkSize = 5 * 1024 * 1024; // 5 MB
  let offset = 0;
  const chunks = [];
  const reader = new FileReader();

  const postProgress = (p) => {
    self.postMessage({ type: 'progress', percent: Math.min(p, 99) });
  };

  const readNextChunk = () => {
    if (offset >= file.size) {
      postProgress(80); // Cap reading progress to 80%
      parseFile();
      return;
    }

    const slice = file.slice(offset, offset + chunkSize);
    reader.readAsArrayBuffer(slice);
  };

  reader.onload = (e) => {
    chunks.push(new Uint8Array(e.target.result));
    offset += chunkSize;
    const readPercent = Math.floor((offset / file.size) * 80); // up to 80%
    postProgress(readPercent);
    readNextChunk();
  };

  reader.onerror = () => {
    self.postMessage({ type: 'error', message: 'Error reading file' });
  };

  const parseFile = () => {
    try {
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const fullData = new Uint8Array(totalLength);
      let pos = 0;
      for (const chunk of chunks) {
        fullData.set(chunk, pos);
        pos += chunk.length;
      }

      importScripts('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');

      // Simulate parsing progress: 80% to 100%
      let fakeProgress = 81;
      const timer = setInterval(() => {
        fakeProgress++;
        postProgress(fakeProgress);
        if (fakeProgress >= 99) clearInterval(timer);
      }, 100); // ~2s delay

      const workbook = XLSX.read(fullData, { type: 'array' });
      const parsedSheets = {};
      workbook.SheetNames.forEach((sheet) => {
        parsedSheets[sheet] = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1 });
      });

      clearInterval(timer);
      self.postMessage({ type: 'progress', percent: 100 });
      self.postMessage({ type: 'success', parsedSheets });
    } catch (error) {
      self.postMessage({ type: 'error', message: error.message });
    }
  };

  readNextChunk();
};


// self.onmessage = async (e) => {
//   const file = e.data.file;
//   const chunkSize = 5 * 1024 * 1024; // 5 MB chunks
//   let offset = 0;
//   const chunks = [];
//   const reader = new FileReader();
//
//   const readNextChunk = () => {
//     if (offset >= file.size) {
//       // All chunks read, process the file
//       try {
//         const fullData = new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
//         // Import XLSX in the worker (requires bundler support)
//         importScripts('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
//         const workbook = XLSX.read(fullData, { type: 'array' });
//         const parsedSheets = {};
//         workbook.SheetNames.forEach((sheet) => {
//           parsedSheets[sheet] = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1 });
//         });
//         self.postMessage({ type: 'success', parsedSheets });
//         self.postMessage({ type: 'progress', percent: 100 });
//         console.log("success", parsedSheets);
//       } catch (error) {
//         self.postMessage({ type: 'error', message: error.message });
//       }
//       return;
//     }
//
//     const slice = file.slice(offset, offset + chunkSize);
//     reader.readAsArrayBuffer(slice);
//   };
//
//   reader.onload = (e) => {
//     const chunk = new Uint8Array(e.target.result);
//     chunks.push(chunk);
//     offset += chunkSize;
//     const percent = Math.min(Math.round((offset / file.size) * 100), 100);
//     console.log(`Worker - Chunk read - Offset: ${offset}, Size: ${chunk.length}, Percent: ${percent}%`);
//     self.postMessage({ type: 'progress', percent });
//     console.log(`Worker - Chunk read - Offset: ${offset}, Percent: ${percent}%`);
//     readNextChunk();
//   };
//
//   reader.onerror = () => {
//     self.postMessage({ type: 'error', message: 'Error reading file' });
//   };
//
//   readNextChunk();
// };