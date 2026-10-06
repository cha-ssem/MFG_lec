/**
 * @file timer.js
 * @description 강의 및 실습 시간 관리를 위한 카운트다운 타이머 모듈
 */

class PracticeTimer {
  constructor(displayId, playPauseBtnId, resetBtnId) {
    this.displayElement = document.getElementById(displayId);
    this.playPauseBtn = document.getElementById(playPauseBtnId);
    this.resetBtn = document.getElementById(resetBtnId);

    this.totalSeconds = 300; // 기본 5분 (300초)
    this.remainingSeconds = this.totalSeconds;
    this.timerId = null;
    this.isRunning = false;

    this.init();
  }

  /**
   * 타이머 초기화 및 이벤트 리스너 연결
   */
  init() {
    this.updateDisplay();

    if (this.playPauseBtn) {
      this.playPauseBtn.addEventListener('click', () => this.toggle());
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.reset());
    }

    // 프리셋 버튼 바인딩
    document.querySelectorAll('.timer-preset-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const minutes = parseInt(e.currentTarget.getAttribute('data-minutes'), 10);
        if (!isNaN(minutes)) {
          this.setMinutes(minutes);
        }
      });
    });
  }

  /**
   * 지정된 분 단위로 타이머를 재설정합니다.
   * @param {number} minutes
   */
  setMinutes(minutes) {
    this.pause();
    this.totalSeconds = minutes * 60;
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay();
    if (this.displayElement) {
      this.displayElement.classList.remove('pulse');
    }
    if (typeof showToast === 'function') {
      showToast(`타이머가 ${minutes}분으로 설정되었습니다.`, 'info');
    }
  }

  /**
   * 시작 / 일시정지 토글
   */
  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  /**
   * 카운트다운 시작
   */
  start() {
    if (this.isRunning) return;
    if (this.remainingSeconds <= 0) {
      this.remainingSeconds = this.totalSeconds;
    }

    this.isRunning = true;
    if (this.playPauseBtn) {
      this.playPauseBtn.textContent = '⏸️';
      this.playPauseBtn.title = '일시정지';
    }

    this.timerId = setInterval(() => {
      this.remainingSeconds--;
      this.updateDisplay();

      if (this.remainingSeconds <= 0) {
        this.onComplete();
      }
    }, 1000);
  }

  /**
   * 일시정지
   */
  pause() {
    this.isRunning = false;
    clearInterval(this.timerId);
    this.timerId = null;
    if (this.playPauseBtn) {
      this.playPauseBtn.textContent = '▶️';
      this.playPauseBtn.title = '시작';
    }
  }

  /**
   * 타이머 초기화
   */
  reset() {
    this.pause();
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplay();
    if (this.displayElement) {
      this.displayElement.classList.remove('pulse');
    }
  }

  /**
   * 시간 종료 시 호출되는 콜백
   */
  onComplete() {
    this.pause();
    if (this.displayElement) {
      this.displayElement.classList.add('pulse');
    }
    if (typeof showToast === 'function') {
      showToast('⏰ 실습 시간이 종료되었습니다!', 'info');
    }
  }

  /**
   * UI 시간 문자열 갱신
   */
  updateDisplay() {
    if (!this.displayElement) return;
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    this.displayElement.textContent = formatted;
  }
}

// DOMContentLoaded 시 타이머 인스턴스 생성
document.addEventListener('DOMContentLoaded', () => {
  window.appTimer = new PracticeTimer('timerDisplay', 'timerPlayPause', 'timerReset');
});
