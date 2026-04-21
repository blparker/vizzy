import type { Animation } from '@vizzyjs/core';
import { clamp } from '@vizzyjs/core';

interface ActiveAnimation {
    animation: Animation;
    finished: boolean;
}

interface ActiveGroup {
    items: ActiveAnimation[];
    startTime: number;
    resolve: () => void;
}

export class AnimationPlayer {
    private active: ActiveGroup | null = null;
    private rafId: number | null = null;
    private renderFn: () => void;
    private paused = false;
    private pausedAt = 0;

    constructor(renderFn: () => void) {
        this.renderFn = renderFn;
    }

    play(animations: Animation[]): Promise<void> {
        return new Promise<void>((resolve) => {
            for (const anim of animations) {
                anim.begin();
            }

            this.active = {
                items: animations.map((animation) => ({ animation, finished: false })),
                startTime: -1,
                resolve,
            };

            if (!this.paused) this.startLoop();
        });
    }

    pause(): void {
        if (this.paused) return;
        this.paused = true;
        this.pausedAt = performance.now();
        this.stopLoop();
    }

    resume(): void {
        if (!this.paused) return;
        this.paused = false;
        if (this.active && this.active.startTime >= 0) {
            this.active.startTime += performance.now() - this.pausedAt;
        }
        if (this.active) this.startLoop();
    }

    get isPaused(): boolean {
        return this.paused;
    }

    wait(seconds: number): Promise<void> {
        const noop: Animation = {
            duration: seconds,
            easing: (t: number) => t,
            targets: [],
            begin() {},
            update() {},
            finish() {},
        };
        return this.play([noop]);
    }

    private tick = (timestamp: number): void => {
        const group = this.active;
        if (!group) {
            this.stopLoop();
            return;
        }

        if (group.startTime < 0) {
            group.startTime = timestamp;
        }

        const elapsed = (timestamp - group.startTime) / 1000;
        let allDone = true;

        for (const item of group.items) {
            if (item.finished) continue;

            const progress = clamp(elapsed / item.animation.duration, 0, 1);
            const easedT = item.animation.easing(progress);
            item.animation.update(easedT);

            if (progress >= 1) {
                item.animation.finish();
                item.finished = true;
            } else {
                allDone = false;
            }
        }

        this.renderFn();

        if (allDone) {
            const resolve = group.resolve;
            this.active = null;
            this.stopLoop();
            resolve();
        } else {
            this.rafId = requestAnimationFrame(this.tick);
        }
    };

    private startLoop(): void {
        if (this.rafId !== null) return;
        this.rafId = requestAnimationFrame(this.tick);
    }

    private stopLoop(): void {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    dispose(): void {
        this.stopLoop();
        if (this.active) {
            this.active.resolve();
            this.active = null;
        }
    }
}
