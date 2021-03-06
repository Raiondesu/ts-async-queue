"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An error raised during the queue execution
 */
var QueueError = /** @class */ (function (_super) {
    __extends(QueueError, _super);
    function QueueError(message, queue, data) {
        var _this = _super.call(this, message) /* istanbul ignore next: because stupid typescript */ || this;
        _this.queue = queue;
        _this.data = data;
        Object.setPrototypeOf(_this, QueueError.prototype);
        _this.name = 'QueueError';
        return _this;
    }
    Object.defineProperty(QueueError.prototype, "failedTask", {
        get: function () {
            return this.queue.currentRunningTask;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueueError.prototype, "failedTaskIndex", {
        get: function () {
            return this.queue.currentTaskIndex;
        },
        enumerable: true,
        configurable: true
    });
    QueueError.prototype.toString = function () {
        return this.name + ': ' + this.message + '\n' + this.data;
    };
    return QueueError;
}(Error));
exports.QueueError = QueueError;
//# sourceMappingURL=queueError.js.map