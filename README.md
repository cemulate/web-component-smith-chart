web-component-smith-chart
=======================

A web component for displaying or selecting points on a Smith Chart.

[Install from npm](https://www.npmjs.com/package/web-component-smith-chart).

See [an example codepen demo](https://codepen.io/cemulate/pen/RzRjaQ).

## Usage

Import the library in your main entrypoint:

```
import 'web-component-smith-chart';
```

Or with a script tag (using unpkg), as:
```
<script src="https://unpkg.com/web-component-smith-chart@1.0.1/dist/web-component-smith-chart.js"/>
```

The custom element is now available and may be used in HTML directly as with:
```
<smith-chart r="[0,0]"></smith-chart>
```

The `smith-chart` element has two attributes:
* `r`: The reflection coefficient; a complex number of magnitude no greater than 1, represented as an array of components `[real, imag]`.
Corresponds to the (x, y) position selected on the smith chart
* `z`: The corresponding normalized load impedance; again a complex number represented in the same way

`r` and `z` are automatically kept in sync (i.e., each is the correct value corresponding to the other on the Smith chart), and either can be set to change the selected point on the chart.
In the example above, the `smith-chart` element's `z` value will be `[1,0]`, corresponding to the `r`-value of `[0,0]`.

`r` and `z` will both be `null` when the element is "unlocked", meaning the cursor will follow the mouse around the element.
Upon clicking, a point is "selected" and `r` and `z` will be populated with their correct values (and a `change` event is fired).
Clicking the element again un-selects/unlocks the point.

Attributes on `polyomino-control` elements are as follows:

The component respects the following CSS variables, which can be used to style it:

* `--hover-color`: The color of the highlighted guide lines / cursor when hovering over the element
* `--select-color`: The color of the guide lines when a point is selected
