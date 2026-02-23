import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Settings, Loader2, RefreshCw, Download, CheckCircle2, AlertCircle } from 'lucide-react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  // Settings state
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [sdUrl, setSdUrl] = useState('http://127.0.0.1:7860');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [ollamaConnected, setOllamaConnected] = useState(false);

  // Fetch Ollama models on load or URL change
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(`${ollamaUrl}/api/tags`);
        if (response.ok) {
          const data = await response.json();
          setModels(data.models || []);
          if (data.models && data.models.length > 0 && !selectedModel) {
            setSelectedModel(data.models[0].name);
          }
          setOllamaConnected(true);
        } else {
          setOllamaConnected(false);
        }
      } catch (err) {
        setOllamaConnected(false);
        console.warn('Could not connect to Ollama at', ollamaUrl);
      }
    };
    fetchModels();
  }, [ollamaUrl]);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || !selectedModel) return;
    
    setIsEnhancing(true);
    setError(null);
    try {
      // Very basic prompt engineering instruction for the LLM
      const systemPrompt = `You are an expert prompt engineer for AI image generators (like Midjourney or Stable Diffusion). 
Your job is to take the user's simple concept and turn it into a highly detailed, descriptive image generation prompt. 
Focus on subject description, lighting, composition, camera angle, and artistic style.
Return ONLY the final enhanced prompt text, nothing else, no conversational filler.`;

      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: `User concept: "${prompt}"\n\nEnhanced prompt:`,
          system: systemPrompt,
          stream: false
        })
      });

      if (!response.ok) throw new Error('Ollama generation failed');
      
      const data = await response.json();
      setEnhancedPrompt(data.response.trim());
    } catch (err) {
      setError('Failed to enhance prompt. Ensure Ollama is running and the model is downloaded.');
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerateImage = async () => {
    const finalPrompt = enhancedPrompt || prompt;
    if (!finalPrompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setImageUrl(null);

    try {
      // Assuming Automatic1111 Stable Diffusion API format for local generation
      const response = await fetch(`${sdUrl}/sdapi/v1/txt2img`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          steps: 20,
          width: 512,
          height: 512,
          cfg_scale: 7
        })
      });

      if (!response.ok) throw new Error(`Image API returned ${response.status}`);

      const data = await response.json();
      if (data.images && data.images.length > 0) {
        // AUTOMATIC1111 returns base64 images
        setImageUrl(`data:image/png;base64,${data.images[0]}`);
      } else {
        throw new Error('No image returned from API');
      }
    } catch (err) {
      setError(`Failed to generate image. Please check your Image Generator API URL (${sdUrl}) and ensure it accepts expected requests (e.g., AUTOMATIC1111 runs with --api).`);
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-container animate-fade-in">
      <header className="header">
        <div className="header-logo">
          <Sparkles className="text-primary" size={28} color="var(--primary)" />
          <span>Lumina<span style={{color: 'var(--text-secondary)', fontWeight: 400}}>Gen</span></span>
        </div>
      </header>

      {/* Settings Sidebar */}
      <aside className="sidebar">
        <div className="glass-panel">
          <div className="flex-between" style={{marginBottom: '1.5rem'}}>
            <h2 className="text-primary" style={{fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Settings size={20} /> Settings
            </h2>
            <div className={`status-badge ${ollamaConnected ? 'active' : ''}`}>
              <div className="status-dot"></div>
              {ollamaConnected ? 'Ollama Online' : 'Ollama Offline'}
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-item">
              <label className="input-label">Ollama API URL</label>
              <input 
                type="text" 
                className="input-field text-sm" 
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                placeholder="http://localhost:11434"
              />
            </div>

            <div className="setting-item">
              <label className="input-label">LLM Model (Prompt Engineer)</label>
              <select 
                className="input-field text-sm"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {models.length === 0 ? (
                  <option value="">No models found...</option>
                ) : (
                  models.map(m => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))
                )}
              </select>
            </div>

            <div className="setting-item" style={{marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem'}}>
              <label className="input-label">Image Generator API URL</label>
              <p className="text-xs text-muted" style={{marginBottom: '0.5rem'}}>
                Point to AUTOMATIC1111 built-in API (requires --api flag)
              </p>
              <input 
                type="text" 
                className="input-field text-sm" 
                value={sdUrl}
                onChange={(e) => setSdUrl(e.target.value)}
                placeholder="http://127.0.0.1:7860"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {error && (
          <div className="glass-panel" style={{borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)'}}>
            <div style={{display: 'flex', gap: '0.75rem', color: '#ef4444'}}>
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="glass-panel">
          <label className="input-label" style={{fontSize: '1rem', marginBottom: '1rem'}}>
            What do you want to create?
          </label>
          <div style={{display: 'flex', gap: '1rem', flexDirection: 'column'}}>
            <textarea
              className="input-field textarea-field"
              placeholder="A futuristic city in the clouds, cyberpunk style..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
              <button 
                className="btn-secondary" 
                style={{display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (!prompt.trim() || !ollamaConnected) ? 0.5 : 1}}
                onClick={handleEnhancePrompt}
                disabled={!prompt.trim() || isEnhancing || !ollamaConnected}
              >
                {isEnhancing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isEnhancing ? 'Enhancing...' : 'Enhance Prompt (Ollama)'}
              </button>
            </div>

            {enhancedPrompt && (
              <div className="animate-fade-in" style={{marginTop: '0.5rem'}}>
                <label className="input-label" style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span>Enhanced Prompt</span>
                  <button className="btn-icon" onClick={() => setEnhancedPrompt('')} title="Clear enhanced prompt"><RefreshCw size={14}/></button>
                </label>
                <textarea
                  className="input-field text-sm"
                  style={{minHeight: '80px'}}
                  value={enhancedPrompt}
                  onChange={(e) => setEnhancedPrompt(e.target.value)}
                />
              </div>
            )}

            <button 
              className="btn-primary" 
              style={{marginTop: '0.5rem', padding: '1rem'}}
              onClick={handleGenerateImage}
              disabled={isGenerating || (!prompt.trim() && !enhancedPrompt.trim())}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Generating Image...
                </>
              ) : (
                <>
                  <ImageIcon size={20} /> Generate Artwork
                </>
              )}
            </button>
          </div>
        </div>

        <div className="glass-panel" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div className="flex-between">
            <h3 className="text-primary" style={{fontWeight: 600}}>Generated Result</h3>
            {imageUrl && (
              <a href={imageUrl} download="generated-image.png" className="btn-icon" title="Download Image">
                <Download size={20} />
              </a>
            )}
          </div>
          
          <div className="image-canvas">
            {isGenerating && (
              <div className="skeleton-loading" />
            )}
            
            {!isGenerating && imageUrl && (
              <img src={imageUrl} alt="Generated UI" className="animate-fade-in" />
            )}
            
            {!isGenerating && !imageUrl && (
              <div style={{color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0.5}}>
                <ImageIcon size={48} />
                <span className="text-sm">Your creation will appear here</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
