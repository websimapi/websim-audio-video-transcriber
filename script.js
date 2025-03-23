import { config } from 'config';

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('mediaFile');
    const fileNameDisplay = document.getElementById('fileName');
    const transcribeBtn = document.getElementById('transcribeBtn');
    const playerContainer = document.getElementById('playerContainer');
    const mediaPlayer = document.getElementById('mediaPlayer');
    const transcript = document.getElementById('transcript');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const loading = document.getElementById('loading');
    const errorEl = document.getElementById('error');

    let mediaFile = null;
    let mediaType = '';
    
    // File selection handler
    fileInput.addEventListener('change', (e) => {
        mediaFile = e.target.files[0];
        
        if (mediaFile) {
            fileNameDisplay.textContent = mediaFile.name;
            transcribeBtn.disabled = false;
            mediaType = mediaFile.type.startsWith('audio/') ? 'audio' : 'video';
        } else {
            fileNameDisplay.textContent = '';
            transcribeBtn.disabled = true;
        }
    });
    
    // Transcribe button handler
    transcribeBtn.addEventListener('click', () => {
        if (!mediaFile) return;
        
        // Reset UI
        errorEl.classList.add('hidden');
        playerContainer.classList.add('hidden');
        loading.classList.remove('hidden');
        
        // Create media element and player
        createMediaPlayer(mediaFile);
        
        // Start transcription
        transcribeMedia(mediaFile);
    });
    
    // Copy to clipboard handler
    copyBtn.addEventListener('click', () => {
        const text = transcript.textContent;
        navigator.clipboard.writeText(text)
            .then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy to Clipboard';
                }, 2000);
            })
            .catch(err => {
                showError('Failed to copy text: ' + err.message);
            });
    });
    
    // Download transcript handler
    downloadBtn.addEventListener('click', () => {
        const text = transcript.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = getFileName(mediaFile.name) + '_transcript.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Creates media player for preview
    function createMediaPlayer(file) {
        mediaPlayer.innerHTML = '';
        
        const element = document.createElement(mediaType);
        element.controls = true;
        element.src = URL.createObjectURL(file);
        mediaPlayer.appendChild(element);
    }
    
    // Transcribes the media using Web Speech API
    function transcribeMedia(file) {
        // For demonstration, we'll use a simulated transcription since
        // browser APIs have limited direct transcription capabilities
        
        // In a real app, you would use a server-side service like:
        // - Google Cloud Speech-to-Text
        // - Microsoft Azure Speech Service
        // - Amazon Transcribe
        // - AssemblyAI
        // - Deepgram
        
        // For this demo, we'll use a simulation
        simulateTranscription(file)
            .then(result => {
                transcript.textContent = result;
                playerContainer.classList.remove('hidden');
                loading.classList.add('hidden');
            })
            .catch(error => {
                showError(error);
                loading.classList.add('hidden');
            });
    }
    
    // This is a simulation of the transcription process
    // In a real app, this would call an external API
    function simulateTranscription(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function() {
                // Just to simulate processing time
                setTimeout(() => {
                    try {
                        // This is where we would normally send the file to a server
                        // For demo purposes, generate a simulated transcript
                        
                        const duration = calculateSimulatedDuration(file.size);
                        const simulatedText = generateSimulatedTranscript(duration);
                        resolve(simulatedText);
                    } catch (error) {
                        reject("Error processing the file: " + error.message);
                    }
                }, 3000); // Simulate 3-second processing time
            };
            
            reader.onerror = function() {
                reject("Error reading the file");
            };
            
            // Start reading the file as ArrayBuffer
            // In a real app we'd likely use FormData to send to server
            reader.readAsArrayBuffer(file.slice(0, Math.min(file.size, 5 * 1024 * 1024))); 
        });
    }
    
    // Helper to calculate simulated media duration from file size
    function calculateSimulatedDuration(fileSize) {
        // Rough estimate: 1MB ~= 1 minute for audio, 10 seconds for video
        const sizeMB = fileSize / (1024 * 1024);
        return mediaType === 'audio' ? sizeMB * 60 : sizeMB * 10;
    }
    
    // Generate a simulated transcript for demo purposes
    function generateSimulatedTranscript(durationSeconds) {
        const sentences = [
            "Welcome to this presentation on innovative technologies.",
            "Today we're going to explore several breakthrough developments.",
            "Artificial intelligence continues to transform many industries.",
            "Machine learning algorithms are becoming increasingly sophisticated.",
            "Natural language processing has seen remarkable improvements.",
            "Cloud computing provides scalable solutions for businesses.",
            "Edge computing is reducing latency in critical applications.",
            "Quantum computing promises to solve complex problems exponentially faster.",
            "Blockchain technology ensures transparent and secure transactions.",
            "Augmented reality is changing how we interact with information.",
            "Virtual reality creates immersive experiences for users.",
            "Internet of Things connects everyday devices to the internet.",
            "5G networks will enable faster and more reliable connections.",
            "Cybersecurity remains a critical concern for organizations.",
            "Renewable energy technologies are becoming more efficient.",
            "Thank you for listening to this presentation."
        ];
        
        // Calculate how many sentences to include based on duration
        const sentenceCount = Math.max(3, Math.min(sentences.length, Math.floor(durationSeconds / 15)));
        let transcript = "";
        
        // Add timestamps and sentences
        for (let i = 0; i < sentenceCount; i++) {
            const timestamp = formatTime(i * 15);
            transcript += `[${timestamp}] ${sentences[i]}\n\n`;
        }
        
        return transcript;
    }
    
    // Format seconds to MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Extract file name without extension
    function getFileName(fullName) {
        return fullName.replace(/\.[^/.]+$/, "");
    }
    
    // Show error message
    function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
});

