window.requestAnimationFrame =
    window.__requestAnimationFrame ||
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    (function () {
        return function (callback, element) {
            var lastTime = element.__lastTime;
            if (lastTime === undefined) {
                lastTime = 0;
            }
            var currTime = Date.now();
            var timeToCall = Math.max(1, 33 - (currTime - lastTime));
            window.setTimeout(callback, timeToCall);
            element.__lastTime = currTime + timeToCall;
        };
    })();
window.isDevice = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(((navigator.userAgent || navigator.vendor || window.opera)).toLowerCase()));
var loaded = false;
var init = function () {
    if (loaded) return;
    loaded = true;
    var mobile = window.isDevice;
    var koef = mobile ? 0.5 : 1;
    var canvas = document.getElementById('heart');
    var ctx = canvas.getContext('2d');
    var width = canvas.width = koef * innerWidth;
    var height = canvas.height = koef * innerHeight;
    var rand = Math.random;
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, width, height);

    var heartPosition = function (rad) {
        //return [Math.sin(rad), Math.cos(rad)];
        return [Math.pow(Math.sin(rad), 3), -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))];
    };
    var scaleAndTranslate = function (pos, sx, sy, dx, dy) {
        return [dx + pos[0] * sx, dy + pos[1] * sy];
    };

    window.addEventListener('resize', function () {
        width = canvas.width = koef * innerWidth;
        height = canvas.height = koef * innerHeight;
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(0, 0, width, height);
    });

    var traceCount = mobile ? 20 : 50;
    var pointsOrigin = [];
    var i;
    var dr = mobile ? 0.3 : 0.1;
    for (i = 0; i < Math.PI * 2; i += dr) pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
    for (i = 0; i < Math.PI * 2; i += dr) pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
    for (i = 0; i < Math.PI * 2; i += dr) pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
    var heartPointsCount = pointsOrigin.length;

    var targetPoints = [];
    var pulse = function (kx, ky) {
        for (i = 0; i < pointsOrigin.length; i++) {
            targetPoints[i] = [];
            targetPoints[i][0] = kx * pointsOrigin[i][0] + width / 2;
            targetPoints[i][1] = ky * pointsOrigin[i][1] + height / 2;
        }
    };

    var e = [];
    for (i = 0; i < heartPointsCount; i++) {
        var x = rand() * width;
        var y = rand() * height;
        e[i] = {
            vx: 0,
            vy: 0,
            R: 2,
            speed: rand() + 5,
            q: ~~(rand() * heartPointsCount),
            D: 2 * (i % 2) - 1,
            force: 0.2 * rand() + 0.7,
            f: "hsla(0," + ~~(40 * rand() + 100) + "%," + ~~(60 * rand() + 20) + "%,.3)",
            trace: []
        };
        for (var k = 0; k < traceCount; k++) e[i].trace[k] = { x: x, y: y };
    }

    var config = {
        traceK: 0.4,
        timeDelta: 0.01
    };

    var time = 0;
    var introStart = null;
    var burstUntil = 0;
    var loop = function () {
        if (introStart === null) introStart = Date.now();
        var intro = Math.min(1, (Date.now() - introStart) / 2600);
        var ease = 1 - Math.pow(1 - intro, 3);
        var zoom = .1 + .9 * ease;
        var bursting = Date.now() < burstUntil;
        var n = -Math.cos(time);
        pulse((1 + n) * .5 * zoom, (1 + n) * .5 * zoom);
        time += ((Math.sin(time)) < 0 ? 9 : (n > 0.8) ? .2 : 1) * config.timeDelta;
        ctx.fillStyle = "rgba(0,0,0,.1)";
        ctx.fillRect(0, 0, width, height);
        for (i = e.length; i--;) {
            var u = e[i];
            var q = targetPoints[u.q];
            var dx = u.trace[0].x - q[0];
            var dy = u.trace[0].y - q[1];
            var length = Math.sqrt(dx * dx + dy * dy);
            if (10 > length) {
                if (0.95 < rand()) {
                    u.q = ~~(rand() * heartPointsCount);
                }
                else {
                    if (0.99 < rand()) {
                        u.D *= -1;
                    }
                    u.q += u.D;
                    u.q %= heartPointsCount;
                    if (0 > u.q) {
                        u.q += heartPointsCount;
                    }
                }
            }
            if (bursting) u.speed = 9 + rand() * 8;
            else if (u.speed > 8) u.speed = 5 + rand();
            u.vx += -dx / length * u.speed;
            u.vy += -dy / length * u.speed;
            u.trace[0].x += u.vx;
            u.trace[0].y += u.vy;
            u.vx *= u.force;
            u.vy *= u.force;
            for (k = 0; k < u.trace.length - 1;) {
                var T = u.trace[k];
                var N = u.trace[++k];
                N.x -= config.traceK * (N.x - T.x);
                N.y -= config.traceK * (N.y - T.y);
            }
            ctx.fillStyle = u.f;
            for (k = 0; k < u.trace.length; k++) {
                ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
            }
        }
        //ctx.fillStyle = "rgba(255,255,255,1)";
        //for (i = u.trace.length; i--;) ctx.fillRect(targetPoints[i][0], targetPoints[i][1], 2, 2);

        window.requestAnimationFrame(loop, canvas);
    };

var messages = [
    "kamu selalu jadi orang yang paling aku tunggu setiap hari",
    "terima kasih sudah hadir di hidup aku, salsaaaa",
    "aku senang bisa punya kamu di hidup aku",
    "satu hal yang pasti, aku sayang kamu, salsaaa",
    "semoga kita bisa terus saling nemenin ke depannya",
    "aku cuma berharap kamu tetap di samping aku",
    "dari sekian banyak tempat, aku tetap paling nyaman sama kamu",
    "bersama kamu, aku merasa jadi versi terbaik dari diriku",
    "semoga kita bisa makin dekat dan makin ngerti satu sama lain",
    "entah kenapa, nama kamu selalu muncul di pikiran aku",
    "kalau lagi kangen, rasanya pengen ketemu dan cerita sama kamu",
    "aku sayang kamu, hari ini dan semoga sampai nanti"
];

    var messageEl = document.getElementById('message');
    var overlay = document.getElementById('overlay');
    var lastMessage = -1;
    var messageTimer = null;
    var showMessage = function (text) {
        messageEl.textContent = text;
        messageEl.classList.add('show');
        if (messageTimer) clearTimeout(messageTimer);
        messageTimer = setTimeout(function () {
            messageEl.classList.remove('show');
        }, 4000);
    };
    var burst = function () {
        burstUntil = Date.now() + 900;
        for (var b = 0; b < e.length; b++) {
            e[b].vx += (rand() - .5) * 26;
            e[b].vy += (rand() - .5) * 26;
        }
    };
    window.addEventListener('click', function (ev) {
        if (ev.target && ev.target.id === 'musicBtn') return;
        burst();
        var pick;
        do { pick = ~~(rand() * messages.length); } while (pick === lastMessage);
        lastMessage = pick;
        showMessage(messages[pick]);
    });

    setTimeout(function () { overlay.classList.remove('hidden'); }, 800);
    loop();
};

var setupMusic = function () {
    var btn = document.getElementById('musicBtn');
    var music = document.getElementById('music');
    if (!btn || !music) return;
    btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (music.paused) {
            var p = music.play();
            if (p && p.catch) p.catch(function () { });
            btn.classList.add('playing');
            btn.innerHTML = '&#9834; matikan lagu';
        } else {
            music.pause();
            btn.classList.remove('playing');
            btn.innerHTML = '&#9835; nyyalakan lagu';
        }
    });
    music.addEventListener('error', function () {
        btn.style.display = 'none';
        var note = document.createElement('div');
        note.className = 'message show';
        note.textContent = 'lagunya belum ada, taruh file music.mp3 di folder ini ya';
        document.body.appendChild(note);
        setTimeout(function () { note.classList.remove('show'); }, 5000);
    });
};

var s = document.readyState;
if (s === 'complete' || s === 'loaded' || s === 'interactive') { init(); setupMusic(); }
else document.addEventListener('DOMContentLoaded', function () { init(); setupMusic(); }, false);
