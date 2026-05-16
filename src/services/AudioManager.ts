const bgmUrl = new URL("../../assets/song.mp3", import.meta.url);

export class AudioManager {
  private bgm?: HTMLAudioElement;

  playBackgroundMusic(): void {
    this.bgm = new Audio(bgmUrl.href);
    this.bgm.loop = true;
    this.bgm.volume = 0.3;
    this.bgm.play().catch((err: unknown) => {
      console.warn("Não foi possível tocar a música automaticamente:", err);
    });
  }
}

export const audio = new AudioManager();
