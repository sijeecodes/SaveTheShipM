/**
 * Mobile touch controls: virtual joystick (movement) + touch-drag camera.
 * Action buttons are added to game.html; this module wires them up.
 */
import nipplejs from 'nipplejs';
import { ControlPanel } from '../scene/controlPanel.js';

export class MobileControls {
  constructor(game) {
    this.game = game;
    this._lastTouchX = 0;
    this._lastTouchY = 0;
    this._cameraTrackingId = null; // active touch identifier for camera drag
    this._joystick = null;
  }

  /** Call once after the renderer/canvas is ready. */
  setup() {
    this._createJoystick();
    this._setupCameraTouch();
    this._setupActionButtons();
    this._showMobileUI();
  }

  destroy() {
    if (this._joystick) {
      this._joystick.destroy();
      this._joystick = null;
    }
  }

  /* ── Virtual joystick (bottom-left) ────────────────────────────── */

  _createJoystick() {
    const zone = document.getElementById('joystickZone');
    if (!zone) return;

    this._joystick = nipplejs.create({
      zone,
      mode: 'dynamic',
      size: 120,
      color: 'rgba(102,126,234,0.5)',
      fadeTime: 250,
    });

    const keys = this.game.inputState.keys;
    this._joystick.on('move', (_e, data) => {
      const { x, y } = data.vector; // -1..1 (y positive = up on screen)
      keys['w'] = y > 0.3;
      keys['s'] = y < -0.3;
      keys['a'] = x < -0.3;
      keys['d'] = x > 0.3;
    });

    this._joystick.on('end', () => {
      keys['w'] = false;
      keys['s'] = false;
      keys['a'] = false;
      keys['d'] = false;
    });
  }

  /* ── Camera drag (right half of screen) ────────────────────────── */

  _setupCameraTouch() {
    const canvas = this.game.renderer.domElement;

    canvas.addEventListener('touchstart', (e) => {
      // Use any touch that starts in the right half of the screen for camera
      for (const touch of e.changedTouches) {
        if (touch.clientX > window.innerWidth * 0.35 && this._cameraTrackingId === null) {
          this._cameraTrackingId = touch.identifier;
          this._lastTouchX = touch.clientX;
          this._lastTouchY = touch.clientY;
          break;
        }
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (this._cameraTrackingId === null) return;
      if (this.game.character.isFixing || this.game.character.isAttacking) return;

      for (const touch of e.changedTouches) {
        if (touch.identifier === this._cameraTrackingId) {
          const dx = touch.clientX - this._lastTouchX;
          const dy = touch.clientY - this._lastTouchY;
          this._lastTouchX = touch.clientX;
          this._lastTouchY = touch.clientY;

          this.game.character.yaw -= dx * 0.005;
          this.game.fpsCamera.pitch -= dy * 0.005;
          this.game.fpsCamera.pitch = Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, this.game.fpsCamera.pitch),
          );
          break;
        }
      }
    }, { passive: true });

    const endCamera = (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier === this._cameraTrackingId) {
          this._cameraTrackingId = null;
          break;
        }
      }
    };
    canvas.addEventListener('touchend', endCamera, { passive: true });
    canvas.addEventListener('touchcancel', endCamera, { passive: true });
  }

  /* ── On-screen action buttons ──────────────────────────────────── */

  _setupActionButtons() {
    const game = this.game;

    // ATTACK button
    const attackBtn = document.getElementById('btnAttack');
    attackBtn?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (game.character.isDead || game.character.isAttacking || game.character.isFixing) return;

      game.character.isAttacking = true;
      const localPlayer = game.players.get(game.playerId);
      if (localPlayer?._model) {
        localPlayer._model.isAttacking = true;
        localPlayer._model.playAnimation('Kick');
      }

      const pos = game.character.getPosition();
      if (game.ws?.readyState === WebSocket.OPEN) {
        game.ws.send(JSON.stringify({
          type: 'playerAttack',
          x: pos.x, y: pos.y, z: pos.z,
          yaw: game.character.getYaw(),
        }));
      }

      setTimeout(() => {
        game.character.isAttacking = false;
        if (localPlayer?._model) {
          localPlayer._model.isAttacking = false;
          localPlayer._model.playAnimation('Idle');
        }
      }, 1000);
    });

    // FIX button
    const fixBtn = document.getElementById('btnFix');
    fixBtn?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (game.character.isDead || game.character.isFixing) return;
      if (game.ws?.readyState !== WebSocket.OPEN) return;

      const playerPos = game.character.getPosition();
      const panel = ControlPanel.getNearestFixablePanel(playerPos, 12);
      if (!panel) return;

      game.character.isFixing = true;
      game.character._fixingPanelId = panel.id;

      const dx = panel.model.position.x - playerPos.x;
      const dz = panel.model.position.z - playerPos.z;
      game.character.yaw = Math.atan2(dx, dz);
      game.character.rotation.y = game.character.yaw;

      const localPlayer = game.players.get(game.playerId);
      if (localPlayer?._model) {
        localPlayer._model.isFixing = true;
        localPlayer._model.playAnimation('Fix');
      }

      game.ws.send(JSON.stringify({ type: 'startFix', panelId: panel.id }));

      game.character._fixSafetyTimeout = setTimeout(() => {
        if (game.character.isFixing) {
          game.character.isFixing = false;
          game.character._fixingPanelId = null;
          const lp = game.players.get(game.playerId);
          if (lp?._model) {
            lp._model.isFixing = false;
            lp._model.playAnimation('Idle');
          }
        }
      }, 20000);
    });

    // FLASHLIGHT button
    const lightBtn = document.getElementById('btnLight');
    lightBtn?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (game.character.isDead) return;

      const spotlightOn = game.scene3d.toggleSpotlight();
      const localPlayer = game.players.get(game.playerId);
      if (localPlayer?._model) localPlayer._model.spotlightOn = spotlightOn;

      if (game.ws?.readyState === WebSocket.OPEN) {
        game.ws.send(JSON.stringify({ type: 'toggleSpotlight', spotlightOn }));
      }
    });

    // JUMP button
    const jumpBtn = document.getElementById('btnJump');
    jumpBtn?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      game.inputState.keys[' '] = true;
    });
    jumpBtn?.addEventListener('touchend', (e) => {
      e.preventDefault();
      game.inputState.keys[' '] = false;
    });
  }

  /* ── Show / hide mobile-only UI ────────────────────────────────── */

  _showMobileUI() {
    document.getElementById('joystickZone')?.classList.add('visible');
    document.getElementById('mobileActions')?.classList.add('visible');
    // Hide the desktop-only controls reference
    document.querySelector('.controls-section')?.classList.add('mobile-hidden');
    // Hide the desktop UI panel on mobile
    document.querySelector('.ui-panel')?.classList.add('mobile-hidden');
  }
}
