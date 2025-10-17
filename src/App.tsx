import React, { useEffect, useCallback, useState } from "react";
import "./App.css";
import { newGame, applyMove, type GameState, type Direction } from "./game";

function CellView({ value }: { value: number | null }) {
    return <div className={`cell cell-${value ?? "empty"}`}>{value ?? ""}</div>;
}

export default function App() {
    const [size, setSize] = useState<number>(4);
    const [state, setState] = useState<GameState>(() => newGame(4));

    useEffect(() => {
        setState(newGame(size));
    }, [size]);

    const restart = useCallback(() => {
        setState(newGame(size));
    }, [size]);

    const handleMove = useCallback(
        (dir: Direction) => {
            setState((prev) => {
                const next = applyMove(prev, dir);
                return next;
            });
        },
        [setState]
    );

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (state.over || state.won) return;
            if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
                e.preventDefault();
                if (e.key === "ArrowLeft") handleMove("left");
                if (e.key === "ArrowRight") handleMove("right");
                if (e.key === "ArrowUp") handleMove("up");
                if (e.key === "ArrowDown") handleMove("down");
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [handleMove, state.over, state.won]);

    return (
        <div className="page">
            <div className="game-container">
                <header className="game-header">
                    <div className="title-area">
                        <h1>2048</h1>
                        <div className="score-boxes">
                            <div className="score-box">
                                <span className="label">SCORE</span>
                                <span className="value">{state.score}</span>
                            </div>
                            <div className="score-box">
                                <span className="label">SIZE</span>
                                <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="size-select">
                                    {[3, 4, 5, 6].map((n) => (
                                        <option key={n} value={n}>
                                            {n}×{n}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* <div className="score-box">
                                <span className="label">BEST</span>
                                <span className="value">{state.best ?? 0}</span>
                            </div> */}
                        </div>
                    </div>

                    <button className="new-game-btn" onClick={restart}>
                        New Game
                    </button>
                    <p className="subtitle">
                        Join the numbers and get to the <strong>2048 tile!</strong>
                    </p>
                </header>

                <div className="board" style={{ gridTemplateColumns: `repeat(${state.size}, 1fr)` }}>
                    {state.board.flat().map((v, i) => (
                        <CellView key={i} value={v} />
                    ))}
                </div>

                {state.won && <div className="overlay">You reached 2048! 🎉</div>}
                {state.over && !state.won && <div className="overlay">Game Over</div>}
            </div>

            <aside className="info-panel">
                <div className="actions">
                    <div className="arrow-row up">
                        <button className="arrow-btn" onClick={() => handleMove("up")}>
                            ↑
                        </button>
                    </div>
                    <div className="arrow-row mid">
                        <button className="arrow-btn" onClick={() => handleMove("left")}>
                            ←
                        </button>
                        <button className="arrow-btn" onClick={() => handleMove("right")}>
                            →
                        </button>
                    </div>
                    <div className="arrow-row down">
                        <button className="arrow-btn" onClick={() => handleMove("down")}>
                            ↓
                        </button>
                    </div>
                </div>
                <h2>How to Play</h2>
                <p>
                    Use your <b>arrow keys</b> or the on-screen buttons to move tiles. When two tiles with the same number touch, they merge into one!
                </p>

                <h3>Tips</h3>
                <ul>
                    <li>Keep your highest tile in a corner.</li>
                    <li>Plan your moves ahead.</li>
                    <li>Combine smaller tiles early to stay organized.</li>
                </ul>

                <h3>Goal</h3>
                <p>
                    Get the <strong>2048 tile</strong> to win!
                </p>
            </aside>
        </div>
    );
}
