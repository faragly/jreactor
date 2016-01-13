var _mouseCoords = {top: 0, left: 0};
(function ($)
{
	var _objects = [];
	var _toString = function (object)
	{
		var text = '';
		var n;
		switch (typeof object) {
			case 'number':
				text = object;
				break;
			case 'object':
				if (object instanceof Array) { // массив
					text = '[';
					n = [];
					for (var i = 0; i < object.length; i++) {
						n.push(_toString(object[i]));
					}
					text += n.join(',');
					text += ']';
				}
				else { // объект
					text = '{';
					n = [];
					for (var obj in object) {
						n.push(obj + ':' + _toString(object[obj]));
					}
					text += n.join(',');
					text += '}';
				}
				break;
			case 'function':
				text = object.toString().replace(/\n/g, '');
				break;
			case 'string':
				text = '"' + object + '"';
				break;
			case 'boolean':
				text = object.toString();
				break;
		}
		return text;
	};
	var indexId = 0;
	$(function () {
		$.jreactor = function (callback)
		{
			var cl = this;
			if (!this._timer) {
				this._timer = setInterval(function ()
				{
					for (var obj in _objects) {
						for (var behav in _objects[obj]._behaviors) {
							var elem = _objects[obj]._behaviors[behav];
							if (elem.value != _toString(elem.callback())) {
								elem.value = _toString(elem.callback());
								_objects[obj]._callback();
							}
						}
					}
				}, 40);
			}
			function exam(callback, id)
			{
				var _event = function (element, events, callback, live)
				{
					var that = this;
					var key;
					if (!callback) {
						key = that._id + element.selector + events;
						if (!that._eventInit[key]) {
							if (live !== undefined) {
								element.live(events, function (e)
								{
									that._events[key] = $(this).val();
									that._callback.call(that);
								});
							}
							else {
								element.bind(events, function (e)
								{
									that._events[key] = $(this).val();
									that._callback.call(that);
								});
							}
							that._events[key] = element.val();
							that._eventInit[key] = true;
						}
					}
					else {
						key = that._id + element.selector + events + _toString(callback);
						if (!that._eventInit[key]) {
							if (live !== undefined) {
								element.live(events, function (e)
								{
									that._events[key] = callback.call(this, e);
									that._callback.call(that);
								});
							}
							else {
								element.bind(events, function (e)
								{
									that._events[key] = callback.call(this, e);
									that._callback.call(that);
								});
							}
							that._eventInit[key] = true;
						}
					}
					return that._events[key];
				};
				var _behavior = function (callback)
				{
					var key = this._id + callback.toString().replace(/\n/g, '');
					if (!this._behaviors[key]) {
						this._behaviors[key] = {callback: callback, value: _toString(callback())};
					}
					return this._behaviors[key].callback();
				};
				return new function ()
				{
					this._id = id;
					this._events = {};
					this._arguments = arguments;
					this._callback = callback;
					this._eventInit = {};
					this._eventClear = function ()
					{
						for (var prop in this._events) {
							delete this._events[prop];
						}
					};
					this._behaviors = {};
					var that = this;
					this.Behavior = function (callback)
					{
						return _behavior.call(that, callback);
					};

					this.Event = function (element, events, callback)
					{
						return _event.call(that, element, events, callback);
					};
					this.Live = function (element, events, callback)
					{
						return _event.call(that, element, events, callback, true);
					};
					this.mouseCoords = function ()
					{
						return _behavior.call(that, function ()
						{
							return _mouseCoords;
						});
					};
				};
			}

			var obj = exam(callback, 'validatorID' + indexId);
			_objects.push(obj);
			obj._callback.call(obj);
			indexId++;
		};
	});
})(jQuery);

$(function ()
{
	$(window).bind('mousemove', function (e)
	{
		event = e || window.event;

		var left = 0;
		var top = 0;
		if (event.pageX || event.pageY) {
			left = event.pageX;
			top = event.pageY;
		}
		else if (event.clientX || event.clientY) {
			left = event.clientX +
				(document.documentElement.scrollLeft || document.body.scrollLeft) -
				document.documentElement.clientLeft;
			top = event.clientY +
				(document.documentElement.scrollTop || document.body.scrollTop) -
				document.documentElement.clientTop;
		}
		_mouseCoords.top = top;
		_mouseCoords.left = left;
	});
});
