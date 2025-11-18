// ==============================================
// levels.js – 350 Tiles, 20 Turrets, SAFE VERSION
// ==============================================
(function () {

    const W = 350;
    const H = 14;

    function blankRow() {
        return "0".repeat(W);
    }

    // SAFE rows array
    let rows = [];
    for (let i = 0; i < H; i++) rows.push(blankRow());

    // ----------------------
    // SAFE HELPERS
    // ----------------------
    function setAt(r, x, ch) {
        if (r < 0 || r >= H) return;
        if (x < 0 || x >= W) return;

        const row = rows[r];
        rows[r] =
            row.substring(0, x) +
            ch +
            row.substring(x + 1);
    }

    function fillRange(r, x1, x2, ch) {
        if (r < 0 || r >= H) return;

        x1 = Math.max(0, x1);
        x2 = Math.min(W - 1, x2);
        if (x1 > x2) return;

        const row = rows[r];

        rows[r] =
            row.substring(0, x1) +
            ch.repeat(x2 - x1 + 1) +
            row.substring(x2 + 1);
    }

    // ----------------------
    // BOTTOM GROUND
    // ----------------------
    rows[H - 1] = "1".repeat(W);
    rows[H - 2] = "1".repeat(W);

    // ----------------------
    // SHORTCUTS
    // ----------------------
    const platform = (r, x, len) => fillRange(r, x, x + len - 1, "1");
    const placeTurret = (r, x) => {
        setAt(r, x, "t");
        setAt(r + 1, x, "1");
    };
    const placeCoin = (r, x) => setAt(r, x, "c");

    // ----------------------
    // LEVEL CONTENT
    // ----------------------

    // --- ZONE 1 ---
    platform(H - 3, 5, 25);
    platform(H - 5, 40, 12);
    platform(H - 4, 70, 14);

    placeTurret(H - 4, 30);
    placeTurret(H - 3, 75);

    // --- ZONE 2 ---
    platform(H - 4, 90, 30);
    platform(H - 6, 120, 16);
    platform(H - 5, 150, 20);

    placeTurret(H - 4, 95);
    placeTurret(H - 6, 130);
    placeTurret(H - 5, 165);

    [22, 48, 86, 115, 138, 166].forEach((x, i) => {
        placeCoin(H - 6 - (i % 2), x);
    });

    // --- ZONE 3 ---
    for (let i = 0; i < 6; i++) {
        const x = 180 + i * 12;
        const r = H - 3 - (i % 3);
        platform(r, x, 8);
        placeTurret(r, x + 4);
    }

    // --- ZONE 4 ---
    platform(H - 4, 250, 30);
    platform(H - 6, 285, 20);
    platform(H - 5, 310, 18);

    const turretXs = [255, 260, 268, 276, 290, 298, 305, 316, 325, 332];
    turretXs.forEach((x, i) => {
        const r = (i % 2 === 0) ? H - 4 : H - 6;
        placeTurret(r, x);
    });

    [245, 270, 305, 330].forEach(x => placeCoin(H - 7, x));

    // --- FLAG ---
    const flagX = W - 6;
    setAt(H - 3, flagX, "f");
    setAt(H - 2, flagX, "1");

    // ----------------------------------------------------
    // DEBUG LENGTH CHECK (zeigt dir die kaputte Zeile an)
    // ----------------------------------------------------
    for (let r = 0; r < rows.length; r++) {
        if (rows[r].length !== W) {
            console.error(
                "FEHLER: Zeile", r,
                "hat Länge", rows[r].length,
                "statt", W
            );
        }
    }

    // EXPORT
    window.LEVELS = [
        {
            w: W,
            h: H,
            spawn: { x: 4, y: H - 4 },
            map: rows
        }
    ];

})();
