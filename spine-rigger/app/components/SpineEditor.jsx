'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { BONE_HIERARCHY, BONE_COLORS, landmarksToPixels, defaultPositions } from '@/lib/bone-definitions';
import { generateSpineJSON, downloadJSON, generateProjectInfo } from '@/lib/spine-export';

const JOINT_RADIUS = 8;
const JOINT_RADIUS_TOUCH = 18; // larger hit area for mobile

export default function SpineEditor() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const [image, setImage] = useState(null);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const [bonePositions, setBonePositions] = useState(null);
  const [dragBone, setDragBone] = useState(null);
  const [selectedBone, setSelectedBone] = useState(null);
  const [status, setStatus] = useState('Upload a sprite to begin');
  const [detecting, setDetecting] = useState(false);
  const [showBoneNames, setShowBoneNames] = useState(true);
  const [canvasScale, setCanvasScale] = useState(1);
  const [opacity, setOpacity] = useState(0.6);

  // Canvas display size (fit to container)
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });

  // Calculate display size when image loads
  useEffect(() => {
    if (!imageSize.w || !containerRef.current) return;
    const containerW = containerRef.current.clientWidth;
    const maxH = window.innerHeight * 0.65;
    const scaleW = containerW / imageSize.w;
    const scaleH = maxH / imageSize.h;
    const scale = Math.min(scaleW, scaleH, 1);
    setCanvasScale(scale);
    setDisplaySize({
      w: Math.floor(imageSize.w * scale),
      h: Math.floor(imageSize.h * scale),
    });
  }, [imageSize]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !displaySize.w) return;
    const ctx = canvas.getContext('2d');

    canvas.width = displaySize.w;
    canvas.height = displaySize.h;

    // Clear
    ctx.clearRect(0, 0, displaySize.w, displaySize.h);

    // Draw sprite
    if (imageRef.current) {
      ctx.globalAlpha = opacity;
      ctx.drawImage(imageRef.current, 0, 0, displaySize.w, displaySize.h);
      ctx.globalAlpha = 1;
    }

    // Draw bones
    if (bonePositions) {
      // Draw connections (lines between parent-child)
      ctx.lineWidth = 2.5;
      for (const bone of BONE_HIERARCHY) {
        if (!bone.parent || !bonePositions[bone.name] || !bonePositions[bone.parent]) continue;
        const from = toDisplay(bonePositions[bone.parent]);
        const to = toDisplay(bonePositions[bone.name]);
        ctx.strokeStyle = BONE_COLORS[bone.name] || '#fff';
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }

      // Draw joints
      for (const bone of BONE_HIERARCHY) {
        const pos = bonePositions[bone.name];
        if (!pos) continue;
        const dp = toDisplay(pos);
        const isSelected = selectedBone === bone.name;
        const isDragging = dragBone === bone.name;
        const r = isSelected || isDragging ? JOINT_RADIUS + 3 : JOINT_RADIUS;

        // Outer ring
        ctx.beginPath();
        ctx.arc(dp.x, dp.y, r + 2, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#fff' : 'rgba(0,0,0,0.6)';
        ctx.fill();

        // Inner circle
        ctx.beginPath();
        ctx.arc(dp.x, dp.y, r, 0, Math.PI * 2);
        ctx.fillStyle = BONE_COLORS[bone.name] || '#fff';
        ctx.fill();

        // Label
        if (showBoneNames) {
          ctx.font = '10px monospace';
          ctx.fillStyle = '#fff';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2.5;
          ctx.strokeText(bone.name, dp.x + r + 4, dp.y + 3);
          ctx.fillText(bone.name, dp.x + r + 4, dp.y + 3);
        }
      }
    }
  }, [bonePositions, displaySize, selectedBone, dragBone, showBoneNames, opacity]);

  // Convert image coords to display coords
  function toDisplay(pos) {
    return { x: pos.x * canvasScale, y: pos.y * canvasScale };
  }

  // Convert display coords to image coords
  function toImage(pos) {
    return { x: pos.x / canvasScale, y: pos.y / canvasScale };
  }

  // Get pointer position relative to canvas
  function getPointerPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  // Find bone near pointer
  function findBoneAt(displayPos) {
    let closest = null;
    let closestDist = JOINT_RADIUS_TOUCH;
    for (const bone of BONE_HIERARCHY) {
      const pos = bonePositions?.[bone.name];
      if (!pos) continue;
      const dp = toDisplay(pos);
      const dist = Math.hypot(dp.x - displayPos.x, dp.y - displayPos.y);
      if (dist < closestDist) {
        closest = bone.name;
        closestDist = dist;
      }
    }
    return closest;
  }

  // --- Pointer handlers ---
  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    if (!bonePositions) return;
    const pos = getPointerPos(e);
    const bone = findBoneAt(pos);
    if (bone) {
      setDragBone(bone);
      setSelectedBone(bone);
    } else {
      setSelectedBone(null);
    }
  }, [bonePositions, canvasScale]);

  const handlePointerMove = useCallback((e) => {
    e.preventDefault();
    if (!dragBone || !bonePositions) return;
    const pos = getPointerPos(e);
    const imgPos = toImage(pos);
    setBonePositions(prev => ({
      ...prev,
      [dragBone]: { x: imgPos.x, y: imgPos.y },
    }));
  }, [dragBone, canvasScale]);

  const handlePointerUp = useCallback(() => {
    setDragBone(null);
  }, []);

  // --- Image upload ---
  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setImage(ev.target.result);
        setImageSize({ w: img.naturalWidth, h: img.naturalHeight });
        setBonePositions(defaultPositions(img.naturalWidth, img.naturalHeight));
        setStatus(`Loaded: ${img.naturalWidth}×${img.naturalHeight}px — Drag bones to position`);
        setSelectedBone(null);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  // --- MediaPipe Pose Detection ---
  async function detectPose() {
    if (!imageRef.current) return;
    setDetecting(true);
    setStatus('Loading MediaPipe model...');

    try {
      const vision = await import('@mediapipe/tasks-vision');
      const { PoseLandmarker, FilesetResolver } = vision;

      const fileset = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );

      const landmarker = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task',
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numPoses: 1,
      });

      setStatus('Detecting pose...');
      const result = landmarker.detect(imageRef.current);

      if (result.landmarks && result.landmarks.length > 0) {
        const positions = landmarksToPixels(
          result.landmarks[0],
          imageSize.w,
          imageSize.h
        );
        if (positions) {
          setBonePositions(prev => ({ ...prev, ...positions }));
          setStatus('Pose detected — review and drag to correct');
        } else {
          setStatus('Detection returned no usable landmarks');
        }
      } else {
        setStatus('No pose detected — use manual placement');
      }

      landmarker.close();
    } catch (err) {
      console.error('MediaPipe error:', err);
      setStatus(`Detection failed: ${err.message}`);
    }

    setDetecting(false);
  }

  // --- Reset bones ---
  function resetBones() {
    if (imageSize.w) {
      setBonePositions(defaultPositions(imageSize.w, imageSize.h));
      setStatus('Bones reset to default positions');
    }
  }

  // --- Export ---
  function exportSpine() {
    if (!bonePositions) return;
    const spineData = generateSpineJSON(bonePositions, imageSize.w, imageSize.h);
    downloadJSON(spineData, 'skeleton.json');
    setStatus('Exported skeleton.json');
  }

  function exportProjectInfo() {
    const info = generateProjectInfo('sprite', imageSize.w, imageSize.h);
    downloadJSON(info, 'project-info.json');
  }

  return (
    <div className="editor">
      {/* Header */}
      <div className="header">
        <h1>Spine Rigger</h1>
        <p className="subtitle">Sprite → Skeleton → Spine JSON</p>
      </div>

      {/* Status */}
      <div className="status-bar">{status}</div>

      {/* Upload */}
      {!image && (
        <label className="upload-zone">
          <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
          <div className="upload-content">
            <span className="upload-icon">⬆</span>
            <span>Tap to upload sprite</span>
            <span className="upload-hint">PNG recommended, transparent BG</span>
          </div>
        </label>
      )}

      {/* Canvas */}
      {image && (
        <>
          <div className="canvas-wrap" ref={containerRef}>
            <canvas
              ref={canvasRef}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              style={{ touchAction: 'none', cursor: dragBone ? 'grabbing' : 'grab' }}
            />
          </div>

          {/* Controls */}
          <div className="controls">
            <div className="control-row">
              <button
                onClick={detectPose}
                disabled={detecting}
                className="btn btn-detect"
              >
                {detecting ? 'Detecting...' : '🔍 Auto-Detect'}
              </button>
              <button onClick={resetBones} className="btn btn-reset">
                ↺ Reset
              </button>
            </div>

            <div className="control-row">
              <label className="slider-label">
                Sprite opacity
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                />
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={showBoneNames}
                  onChange={(e) => setShowBoneNames(e.target.checked)}
                />
                Labels
              </label>
            </div>

            {/* Selected bone info */}
            {selectedBone && bonePositions?.[selectedBone] && (
              <div className="bone-info">
                <span
                  className="bone-dot"
                  style={{ backgroundColor: BONE_COLORS[selectedBone] }}
                />
                <span className="bone-name">{selectedBone}</span>
                <span className="bone-coords">
                  x: {Math.round(bonePositions[selectedBone].x)}{' '}
                  y: {Math.round(bonePositions[selectedBone].y)}
                </span>
              </div>
            )}

            {/* Export */}
            <div className="control-row">
              <button onClick={exportSpine} className="btn btn-export">
                📦 Export Spine JSON
              </button>
              <button onClick={exportProjectInfo} className="btn btn-info">
                ℹ Setup Info
              </button>
            </div>

            {/* New image */}
            <label className="btn btn-new">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />
              🖼 New Sprite
            </label>
          </div>

          {/* Bone list */}
          <div className="bone-list">
            <h3>Bones ({BONE_HIERARCHY.length})</h3>
            <div className="bone-grid">
              {BONE_HIERARCHY.map(bone => (
                <button
                  key={bone.name}
                  className={`bone-item ${selectedBone === bone.name ? 'selected' : ''}`}
                  onClick={() => setSelectedBone(bone.name)}
                >
                  <span
                    className="bone-dot"
                    style={{ backgroundColor: BONE_COLORS[bone.name] }}
                  />
                  <span>{bone.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .editor {
          max-width: 600px;
          margin: 0 auto;
          padding: 12px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          color: #e0e0e0;
          min-height: 100dvh;
        }
        .header {
          text-align: center;
          margin-bottom: 12px;
        }
        .header h1 {
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .subtitle {
          font-size: 11px;
          color: #888;
          margin: 2px 0 0;
        }
        .status-bar {
          background: #1a1a2e;
          border: 1px solid #2a2a4a;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 12px;
          color: #7fdbca;
          margin-bottom: 12px;
          text-align: center;
        }
        .upload-zone {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #3a3a5a;
          border-radius: 12px;
          padding: 48px 24px;
          cursor: pointer;
          transition: border-color 0.2s;
          background: #12121e;
        }
        .upload-zone:active {
          border-color: #7fdbca;
        }
        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #888;
          font-size: 14px;
        }
        .upload-icon {
          font-size: 32px;
        }
        .upload-hint {
          font-size: 11px;
          color: #555;
        }
        .canvas-wrap {
          background: #0a0a14;
          border: 1px solid #2a2a4a;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
        }
        canvas {
          display: block;
          max-width: 100%;
        }
        .controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }
        .control-row {
          display: flex;
          gap: 8px;
        }
        .btn {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #2a2a4a;
          border-radius: 6px;
          background: #1a1a2e;
          color: #e0e0e0;
          font-family: inherit;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
          text-align: center;
        }
        .btn:active {
          transform: scale(0.97);
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: wait;
        }
        .btn-detect {
          background: #162032;
          border-color: #2a5080;
          color: #7fdbca;
        }
        .btn-export {
          background: #1a2e1a;
          border-color: #2a5a2a;
          color: #7fdb8a;
        }
        .btn-reset {
          background: #2e1a1a;
          border-color: #5a2a2a;
          color: #db7f7f;
          flex: 0.5;
        }
        .btn-info {
          flex: 0.4;
          font-size: 12px;
        }
        .btn-new {
          display: block;
          cursor: pointer;
        }
        .slider-label {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #888;
        }
        .slider-label input[type="range"] {
          flex: 1;
          accent-color: #7fdbca;
        }
        .check-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #888;
        }
        .bone-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background: #1a1a2e;
          border: 1px solid #2a2a4a;
          border-radius: 6px;
          font-size: 12px;
        }
        .bone-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .bone-name {
          font-weight: 600;
          color: #fff;
        }
        .bone-coords {
          color: #888;
          margin-left: auto;
          font-size: 11px;
        }
        .bone-list {
          background: #12121e;
          border: 1px solid #2a2a4a;
          border-radius: 8px;
          padding: 12px;
        }
        .bone-list h3 {
          font-size: 13px;
          color: #888;
          margin: 0 0 8px;
          font-weight: 500;
        }
        .bone-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .bone-item {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: #1a1a2e;
          border: 1px solid transparent;
          border-radius: 4px;
          color: #aaa;
          font-family: inherit;
          font-size: 10px;
          cursor: pointer;
        }
        .bone-item.selected {
          border-color: #7fdbca;
          color: #fff;
          background: #1a2e2e;
        }
      `}</style>
    </div>
  );
}
