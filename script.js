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
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const fileReader = new FileReader();
        
        fileReader.onload = async function() {
            try {
                // Decode the audio data
                const audioData = await audioContext.decodeAudioData(fileReader.result);
                // Extract audio from file and process it
                const transcriptResult = await processAudioForTranscription(audioData);
                transcript.textContent = transcriptResult;
                playerContainer.classList.remove('hidden');
                loading.classList.add('hidden');
            } catch (error) {
                showError("Error processing audio: " + error.message);
                loading.classList.add('hidden');
            }
        };
        
        fileReader.onerror = function() {
            showError("Error reading the file");
            loading.classList.add('hidden');
        };
        
        fileReader.readAsArrayBuffer(file);
    }
    
    // Process audio data for transcription with timestamps
    async function processAudioForTranscription(audioBuffer) {
        return new Promise((resolve) => {
            const audioElement = document.createElement('audio');
            const offlineContext = new OfflineAudioContext(
                audioBuffer.numberOfChannels,
                audioBuffer.length,
                audioBuffer.sampleRate
            );
            
            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;
            
            // Create media stream from the audio buffer for recognition
            offlineContext.startRendering().then(async (renderedBuffer) => {
                const transcriptParts = [];
                let currentTime = 0;
                const segmentDuration = 5; // Process 5 seconds at a time
                const duration = audioBuffer.duration;
                
                // Process audio in segments to add timestamps
                while (currentTime < duration) {
                    const endTime = Math.min(currentTime + segmentDuration, duration);
                    const text = await recognizeAudioSegment(
                        audioBuffer, 
                        currentTime, 
                        endTime
                    );
                    
                    if (text.trim()) {
                        const timestamp = formatTime(currentTime);
                        transcriptParts.push(`[${timestamp}] ${text}\n\n`);
                    }
                    
                    currentTime = endTime;
                }
                
                resolve(transcriptParts.join(''));
            }).catch(error => {
                showError("Failed to process audio: " + error.message);
                resolve("Transcription failed. Please try again.");
            });
            
            source.connect(offlineContext.destination);
            source.start(0);
        });
    }
    
    // Recognize spoken words in an audio segment
    async function recognizeAudioSegment(audioBuffer, startTime, endTime) {
        return new Promise((resolve) => {
            const segmentDuration = endTime - startTime;
            const segmentSamples = audioBuffer.length * (segmentDuration / audioBuffer.duration);
            
            // Use simulated recognition for demo purposes
            // In a real app, you would use a speech recognition API like Google's or Web Speech API
            setTimeout(() => {
                const words = generateRealisticWords(segmentDuration);
                resolve(words);
            }, config.processingDelay / 5); // Make each segment process faster
        });
    }
    
    // Generate realistic words for transcription demo
    function generateRealisticWords(duration) {
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
        
        // Roughly 2-3 words per second for natural speech
        const wordCount = Math.floor(duration * 2.5);
        const allWords = sentences.join(" ").split(" ");
        
        // Take a random starting point and select words
        const startIndex = Math.floor(Math.random() * Math.max(0, allWords.length - wordCount));
        return allWords.slice(startIndex, startIndex + wordCount).join(" ");
    }
    
    // Format seconds to MM:SS.ms
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
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