var contentEditor = angular.module("resizeModule", []);
contentEditor.directive("ceResize", function ($document) {
    return function ($scope, $element, $attr) {

        // Function to manage resize up event
        var resizeUp = function ($event) {
            var top = $event.pageY;
            var height = $element[0].offsetTop + $element[0].offsetHeight - $event.pageY;

            if ($event.pageY < $element[0].offsetTop + $element[0].offsetHeight - 50) {
                $element.css({
                    top: top + "px",
                    height: height + "px"
                });
            } else {
                $element.css({
                    top: $element[0].offsetTop + $element[0].offsetHeight - 50 + "px",
                    height: "50px"
                });
            }
        };

        // Function to manage resize right event
        var resizeRight = function ($event) {
            var width = $event.pageX - $element[0].offsetLeft;

            if ($event.pageX > $element[0].offsetLeft + 50) {
                $element.css({
                    width: width + "px"
                });
            } else {
                $element.css({
                    width: "50px",
                });
            }
        };

        // Function to manage resize down event
        var resizeDown = function ($event) {
            var height = $event.pageY - $element[0].offsetTop;

            if ($event.pageY > $element[0].offsetTop + 50) {
                $element.css({
                    height: height + "px"
                });
            } else {
                $element.css({
                    height: "50px"
                });
            }
        };

        // Function to manage resize left event
        var resizeLeft = function ($event) {
            var left = $event.pageX;
            var width = $element[0].offsetLeft + $element[0].offsetWidth - $event.pageX;

            if ($event.pageX < $element[0].offsetLeft + $element[0].offsetWidth - 50) {
                $element.css({
                    left: left + "px",
                    width: width + "px"
                });
            } else {
                $element.css({
                    left: $element[0].offsetLeft + $element[0].offsetWidth - 50 + "px",
                    width: "50px"
                });
            }
        };

        // Create a div to catch resize up event
        var newElement = angular.element('<div class="n-resize border"></div>');
        $element.append(newElement);
        newElement.on("mousedown", function () {
            $document.on("mousemove", mousemove);
            $document.on("mouseup", mouseup);

            function mousemove($event) {
                event.preventDefault();
                resizeUp($event);
            }

            function mouseup() {
                $document.off("mousemove", mousemove);
                $document.off("mouseup", mouseup);
            }
        });

        // Create a div to catch resize right event
        newElement = angular.element('<div class="e-resize border"></div>');
        $element.append(newElement);
        newElement.on("mousedown", function () {
            $document.on("mousemove", mousemove);
            $document.on("mouseup", mouseup);

            function mousemove($event) {
                event.preventDefault();
                resizeRight($event);
            }

            function mouseup() {
                $document.off("mousemove", mousemove);
                $document.off("mouseup", mouseup);
            }
        });

        // Create a div to catch resize down event
        newElement = angular.element('<div class="s-resize border"></div>');
        $element.append(newElement);
        newElement.on("mousedown", function () {
            $document.on("mousemove", mousemove);
            $document.on("mouseup", mouseup);

            function mousemove($event) {
                event.preventDefault();
                resizeDown($event);
            }

            function mouseup() {
                $document.off("mousemove", mousemove);
                $document.off("mouseup", mouseup);
            }
        });

        // Create a div to catch resize left event
        newElement = angular.element('<div class="w-resize border"></div>');
        $element.append(newElement);
        newElement.on("mousedown", function () {
            $document.on("mousemove", mousemove);
            $document.on("mouseup", mouseup);

            function mousemove($event) {
                event.preventDefault();
                resizeLeft($event);
            }

            function mouseup() {
                $document.off("mousemove", mousemove);
                $document.off("mouseup", mouseup);
            }
        });

        // Create a div to catch resize up left event
        newElement = angular.element('<div class="nw-resize border"></div>');
        $element.append(newElement);
        newElement.on("mousedown", function () {
            $document.on("mousemove", mousemove);
            $document.on("mouseup", mouseup);

            function mousemove($event) {
                event.preventDefault();
                resizeUp($event);
                resizeLeft($event);
            }

            function mouseup() {
                $document.off("mousemove", mousemove);
                $document.off("mouseup", mouseup);
            }
        });

        // Create a div to catch resize up right event
        newElement = angular.element('<div class="ne-resize border"></div>');
        $element.append(newElement);
        newElement.on("mousedown", function () {
            $document.on("mousemove", mousemove);
            $document.on("mouseup", mouseup);

            function mousemove($event) {
                event.preventDefault();
                resizeUp($event);
                resizeRight($event);
            }

            function mouseup() {
                $document.off("mousemove", mousemove);
                $document.off("mouseup", mouseup);
            }
        });

        // Create a div to catch resize down right event
        newElement = angular.element('<div class="se-resize border"></div>');
        $element.append(newElement);
        newElement.on("mousedown", function () {
            $document.on("mousemove", mousemove);
            $document.on("mouseup", mouseup);

            function mousemove($event) {
                event.preventDefault();
                resizeDown($event);
                resizeRight($event);
            }

            function mouseup() {
                $document.off("mousemove", mousemove);
                $document.off("mouseup", mouseup);
            }
        });

        // Create a div to catch resize down left event
        newElement = angular.element('<div class="sw-resize border"></div>');
        $element.append(newElement);
        newElement.on("mousedown", function () {
            $document.on("mousemove", mousemove);
            $document.on("mouseup", mouseup);

            function mousemove($event) {
                event.preventDefault();
                resizeDown($event);
                resizeLeft($event);
            }

            function mouseup() {
                $document.off("mousemove", mousemove);
                $document.off("mouseup", mouseup);
            }
        });
    };
});