(function () {
  const LOCALIZATION = {
    en: {
      fabText: "Report an Issue / Ask Help",
      title: "What's on your mind? Let's fix it together.",
      bugOpt: "Bug Report 🐛",
      featureOpt: "Feature Request ✨",
      titleLabel: "Short Title",
      titlePlaceholderBug: "Briefly describe what broke...",
      titlePlaceholderFeat: "What would you like to see added?",
      descLabel: "Detailed Description",
      descPlaceholderBug: "What happened? Steps to reproduce, if you can.",
      descPlaceholderFeat: "What problem would this feature solve for you?",
      captureBtn: "📷 Capture Live Viewport Screen",
      pasteLabel: "📋 Or click anywhere inside this panel and press Ctrl+V to paste an image link asset.",
      submitBug: "Submit Bug Report",
      submitFeat: "Submit Feature Request",
      cancel: "Cancel",
      success: "Thank you! Your report has been logged as "
    },
    am: {
      fabText: "ችግር ወይም ሃሳብ ያሳውቁ",
      title: "ምን አጋጠመዎት? አብረን እንፍታው።",
      bugOpt: "ስህተት ሪፖርት (Bug) 🐛",
      featureOpt: "አዲስ ተግባር ፍላጎት ✨",
      titleLabel: "አጭር ርዕስ",
      titlePlaceholderBug: "ምን እንደተበላሸ በአጭሩ ይግለጹ...",
      titlePlaceholderFeat: "ምን እንዲጨመር ይፈልጋሉ?",
      descLabel: "ዝርዝር ማብራሪያ",
      descPlaceholderBug: "ምን አጋጠመ? ለመድገም የተከተሉት እርምጃዎች ምንድን ናቸው?",
      descPlaceholderFeat: "ይህ አዲስ ተግባር ምን አይነት ችግር ይፈታሎታል?",
      captureBtn: "📷 የቀጥታ ስክሪን ፎቶ አንሳ",
      pasteLabel: "📋 ወይም በዚህ ፓነል ውስጥ ጠቅ አድርገው ምስል ለመለጠፍ Ctrl+V ይጫኑ።",
      submitBug: "ስህተቱን መዝግብ",
      submitFeat: "ሃሳቡን መዝግብ",
      cancel: "ሰርዝ",
      success: "እናመሰግናለን! ሪፖርትዎ በዚህ መለያ ቁጥር ተመዝግቧል፡ "
    }
  };

  class TicketWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.currentLang = 'en';
      this.ticketType = 'bug';
      this.capturedBlob = null; // Memory bucket tracking raw image binary arrays
    }

    connectedCallback() {
      this.systemKey = this.getAttribute('data-system-key');
      this.render();
      this.setupEventListeners();
    }

    render() {
      const t = LOCALIZATION[this.currentLang];
      
      this.shadowRoot.innerHTML = `
        <style>
          :host { --primary: #0070f3; --bg: #ffffff; --text: #111111; }
          .widget-fab { position: fixed; bottom: 24px; right: 24px; background: var(--primary); color: #fff; padding: 14px 20px; border-radius: 50px; font-family: system-ui, sans-serif; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-weight: bold; z-index: 99999; display: flex; align-items: center; gap: 8px; border: none; }
          .drawer { position: fixed; top: 0; right: -450px; width: 420px; height: 100%; background: var(--bg); box-shadow: -4px 0 24px rgba(0,0,0,0.15); z-index: 100000; transition: right 0.3s ease; font-family: system-ui, sans-serif; display: flex; flex-direction: column; box-sizing: border-box; }
          .drawer.open { right: 0; }
          .header { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
          .header h3 { margin: 0; font-size: 15px; color: var(--text); }
          .lang-toggle { background: #eee; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; }
          .content { padding: 20px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
          .type-selector { display: flex; gap: 10px; }
          .type-btn { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 6px; background: #fff; cursor: pointer; font-weight: bold; text-align: center; }
          .type-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
          .form-group { display: flex; flex-direction: column; gap: 6px; }
          .form-group label { font-size: 13px; font-weight: 600; }
          .form-group input, .form-group textarea { padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-family: inherit; font-size: 14px; }
          .form-group textarea { resize: none; height: 90px; }
          
          /* Capture features styles block */
          .capture-zone { border: 2px dashed #ccc; border-radius: 6px; padding: 12px; text-align: center; background: #fafafa; display: flex; flex-direction: column; gap: 8px; align-items: center; }
          .btn-capture { background: #333; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px; width: 100%; }
          .paste-hint { font-size: 11px; color: #666; }
          .preview-container { position: relative; width: 100%; max-height: 120px; overflow: hidden; border-radius: 4px; border: 1px solid #ddd; margin-top: 5px; display: none; }
          .preview-image { width: 100%; height: auto; display: block; }
          .btn-remove-preview { position: absolute; top: 4px; right: 4px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-weight: bold; line-height: 20px; text-align: center; }

          .footer { padding: 20px; border-top: 1px solid #eee; display: flex; gap: 10px; }
          .btn-submit { flex: 2; background: var(--primary); color: white; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; }
          .btn-cancel { flex: 1; background: #eee; color: #333; border: none; padding: 12px; border-radius: 6px; cursor: pointer; }
          .success-screen { padding: 40px 20px; text-align: center; display: flex; flex-direction: column; gap: 12px; justify-content: center; height: 80%; }
        </style>

        <button class="widget-fab">💬 <span>${t.fabText}</span></button>

        <div class="drawer" tabindex="0">
          <div class="header">
            <h3>${t.title}</h3>
            <button class="lang-toggle">${this.currentLang === 'en' ? 'አማርኛ' : 'English'}</button>
          </div>
          
          <div class="content" id="drawer-body">
            <div class="type-selector">
              <button class="type-btn ${this.ticketType === 'bug' ? 'active' : ''}" id="btn-bug">${t.bugOpt}</button>
              <button class="type-btn ${this.ticketType === 'feature_request' ? 'active' : ''}" id="btn-feat">${t.featureOpt}</button>
            </div>

            <div class="form-group">
              <label>${t.titleLabel}</label>
              <input type="text" id="ticket-title" required placeholder="${this.ticketType === 'bug' ? t.titlePlaceholderBug : t.titlePlaceholderFeat}">
            </div>

            <div class="form-group">
              <label>${t.descLabel}</label>
              <textarea id="ticket-desc" required placeholder="${this.ticketType === 'bug' ? t.descPlaceholderBug : t.descPlaceholderFeat}"></textarea>
            </div>

            <div class="capture-zone">
              <button type="button" class="btn-capture">${t.captureBtn}</button>
              <div class="paste-hint">${t.pasteLabel}</div>
              <div class="preview-container" id="preview-box">
                <button type="button" class="btn-remove-preview" id="btn-clear-img">×</button>
                <img class="preview-image" id="img-render" src="" alt="Capture Snapshot Preview" />
              </div>
            </div>
          </div>

          <div class="footer" id="drawer-footer">
            <button class="btn-cancel">${t.cancel}</button>
            <button class="btn-submit">${this.ticketType === 'bug' ? t.submitBug : t.submitFeat}</button>
          </div>
        </div>
      `;
    }

    setupEventListeners() {
      const root = this.shadowRoot;
      const drawer = root.querySelector('.drawer');
      
      root.querySelector('.widget-fab').addEventListener('click', () => { drawer.classList.add('open'); drawer.focus(); });
      root.querySelector('.btn-cancel').addEventListener('click', () => drawer.classList.remove('open'));
      
      root.querySelector('.lang-toggle').addEventListener('click', () => {
        this.currentLang = this.currentLang === 'en' ? 'am' : 'en';
        this.render();
        this.setupEventListeners();
      });

      root.querySelector('#btn-bug').addEventListener('click', () => { this.ticketType = 'bug'; this.updateFormType(); });
      root.querySelector('#btn-feat').addEventListener('click', () => { this.ticketType = 'feature_request'; this.updateFormType(); });
      root.querySelector('.btn-capture').addEventListener('click', () => this.executeScreenCaptureStream());
      root.querySelector('#btn-clear-img').addEventListener('click', () => this.clearActivePreviewContainer());
      root.querySelector('.btn-submit').addEventListener('click', () => this.handleFormSubmissionPayloads());

      // Clipboard Paste Event Listener Hook Integration
      drawer.addEventListener('paste', (e) => this.interceptClipboardPasteEvent(e));
    }

    updateFormType() {
      const root = this.shadowRoot;
      const t = LOCALIZATION[this.currentLang];
      root.querySelector('#btn-bug').className = `type-btn ${this.ticketType === 'bug' ? 'active' : ''}`;
      root.querySelector('#btn-feat').className = `type-btn ${this.ticketType === 'feature_request' ? 'active' : ''}`;
      root.querySelector('#ticket-title').placeholder = this.ticketType === 'bug' ? t.titlePlaceholderBug : t.titlePlaceholderFeat;
      root.querySelector('#ticket-desc').placeholder = this.ticketType === 'bug' ? t.descPlaceholderBug : t.descPlaceholderFeat;
      root.querySelector('.btn-submit').innerText = this.ticketType === 'bug' ? t.submitBug : t.submitFeat;
    }

    async executeScreenCaptureStream() {
      const root = this.shadowRoot;
      try {
        // Request cross-origin screen track capture frames natively
        const captureStream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: "browser", cursor: "never" },
          audio: false
        });
        const videoTrack = captureStream.getVideoTracks()[0];

        // Process active stream data layout onto background engine memory canvas configurations
        const videoElement = document.createElement('video');
        videoElement.srcObject = captureStream;
        videoElement.autoplay = true;
        videoElement.onloadedmetadata = () => {
          setTimeout(() => {
            const memoryCanvas = document.createElement('canvas');
            memoryCanvas.width = videoElement.videoWidth;
            memoryCanvas.height = videoElement.videoHeight;
            const ctx = memoryCanvas.getContext('2d');
            ctx.drawImage(videoElement, 0, 0, memoryCanvas.width, memoryCanvas.height);
            
            // Clean up and stop stream cameras instantly
            videoTrack.stop();
            captureStream.getTracks().forEach(track => track.stop());
            
            // Convert raw viewport data mappings out into readable base64 structures
            memoryCanvas.toBlob((blob) => {
              this.capturedBlob = blob;
              this.displayImagePreview(URL.createObjectURL(blob));
            }, 'image/png');
          }, 500);
        };
      } catch (err) {
        console.warn("Screen display permission sequence was bypassed or rejected by client rules.", err);
      }
    }

    interceptClipboardPasteEvent(e) {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') === 0) {
          const file = items[i].getAsFile();
          this.capturedBlob = file;
          this.displayImagePreview(URL.createObjectURL(file));
          e.preventDefault();
          break;
        }
      }
    }

    displayImagePreview(srcUrl) {
      const root = this.shadowRoot;
      const previewBox = root.querySelector('#preview-box');
      const imgRender = root.querySelector('#img-render');
      imgRender.src = srcUrl;
      previewBox.style.display = 'block';
    }

    clearActivePreviewContainer() {
      const root = this.shadowRoot;
      this.capturedBlob = null;
      root.querySelector('#img-render').src = "";
      root.querySelector('#preview-box').style.display = 'none';
    }

    async handleFormSubmissionPayloads() {
      const root = this.shadowRoot;
      const title = root.querySelector('#ticket-title').value;
      const description = root.querySelector('#ticket-desc').value;
      
      if (!title || !description) {
        return alert(this.currentLang === 'am' ? 'እባክዎ ሁሉንም ቦታዎች ያሟሉ!' : 'Please fill in all required fields!');
      }
      
      const submitBtn = root.querySelector('.btn-submit');
      submitBtn.disabled = true;
      
      // Crucial: Swap JSON mechanics with raw Multipart FormData mappings to support binary file transfers
      const dataPayload = new FormData();
      dataPayload.append('type', this.ticketType);
      dataPayload.append('title', title);
      dataPayload.append('description', description);
      dataPayload.append('page_url', window.location.href);
      dataPayload.append('browser_info', navigator.userAgent);
      
      if (this.capturedBlob) {
        dataPayload.append('screenshot', this.capturedBlob, 'viewport_capture.png');
      }
      
      try {
        const response = await fetch('http://localhost:5000/api/tickets', {
          method: 'POST',
          headers: {
            'X-Widget-Key': this.systemKey,
            'Accept-Language': this.currentLang
          },
          body: dataPayload
        });
        
        const result = await response.json();
        
        if (response.ok) {
          const t = LOCALIZATION[this.currentLang];
          // FIXED: Added missing backticks for template literal string
          root.querySelector('#drawer-body').innerHTML = `<div class="success-screen"> <h2>🎉 Success!</h2> <p>${t.success} <strong>${result.ticketReference}</strong></p> </div>`;
          root.querySelector('#drawer-footer').style.display = 'none';
          
          setTimeout(() => {
            root.querySelector('.drawer').classList.remove('open');
            this.render();
            this.setupEventListeners();
          }, 4000);
        } else {
          alert(result.error || 'Submission sequence crashed.');
          submitBtn.disabled = false;
        }
      } catch (err) {
        console.error(err);
        submitBtn.disabled = false;
      }
    }
  }

  customElements.define('internal-ticket-widget', TicketWidget);
})();