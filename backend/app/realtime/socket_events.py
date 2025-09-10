from __future__ import annotations
from flask_socketio import emit

"""Socket.IO event handlers.

Import 時点で app.__init__ が socketio をまだ定義していないケースで
循環参照が起きるのを避けるため、デコレータ登録を遅延させる。
"""

_registered = False


def _register_handlers():
    global _registered
    if _registered:
        return
    # ローカル import で循環依存回避
    from .. import socketio  # type: ignore

    @socketio.on('connect')
    def on_connect():  # type: ignore
        emit('system', {'message': 'connected'})

    @socketio.on('disconnect')
    def on_disconnect():  # type: ignore
        pass

    _registered = True


# create_app() 完了後に app.__init__ から呼ばれる想定
def ensure_registered():
    _register_handlers()

