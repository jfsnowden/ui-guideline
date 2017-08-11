/**
 * Created by shizhonghua on 2016/9/5.
 */
if ('function' !== typeof DataTransfer.prototype.setDragImage) {
    DataTransfer.prototype.setDragImage = function(image, offsetX, offsetY, node) {
        node.appendChild(image);
        node.classList.add("dragging-ie-transform");
        setTimeout(function() {
            node.classList.remove("dragging-ie-transform");
            node.removeChild(image);
        }, 0);
    };
}