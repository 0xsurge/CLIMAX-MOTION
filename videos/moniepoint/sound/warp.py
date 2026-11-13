# Same time warp as the film (film5): film time t -> real time tr. The hill beat gains 1.0 s.
import numpy as np
def _sm(x): x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)
_dt = .001; _x = np.arange(44000) * _dt; _b = _sm((_x - 4.9) / .5) * (1 - _sm((_x - 7.2) / .5)); _amp = 1.0 / (_b.sum() * _dt)
_T = np.concatenate([[0], np.cumsum((1 - _amp * _b) * _dt)]); _TR = np.arange(len(_T)) * _dt
def real(t): return float(np.interp(t, _T, _TR))
