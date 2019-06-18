import { LitElement, html, css, svg } from 'lit-element';

// r = reflection coefficient
// z = normalized load impedance
// z = (1 + r) / (1 - r)

// Calculuates the circle on the r-plane where Re(z) = k
function rCircle(k) {
    return {
        cx: k / (k + 1),
        cy: 0,
        r: 1 / (k + 1),
    };
}

// Calculates the circle on the r-plane where Im(z) = k
function iCircle(k) {
    return {
        cx: 1,
        cy: 1 / k,
        r: Math.abs(1 / k),
    };
}

function* range(start, end, step) {
    for (let i = start; i < end; i += step) {
        yield i;
    }
}

// Circles for the gray background guides
const backgroundRCircles = Array.from(range(0, 10.1, 0.2)).map(rCircle);
const backgroundICircles = Array.from(range(-5, 5.1, 0.2)).map(iCircle);

// Calculate z from r (represented as real/imaginary pairs)
function calcZ([ rx, ry ]) {
    const denom = rx**2 - 2*rx + 1 + ry**2;
    return [
        (1 - rx**2 - ry**2) / denom,
        2*ry / denom,
    ];
}

// Calculate r from z (represented as real/imaginary pairs)
function calcR([ zx, zy ]) {
    const denom = zx**2 + 2*zx + 1 + zy**2;
    return [
        (zx**2 + zy**2 - 1) / denom,
        2*zy / denom,
    ];
}

// For an event occuring on an svg element, get it's location
// as it would be represented in the svg element's coordinate system
function getEventLocationInSvgCoordinates(event) {
    let canvas = event.target.closest('svg');
    let pt = canvas.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;

    // The cursor point, translated into svg coordinates
    var cursorpt =  pt.matrixTransform(canvas.getScreenCTM().inverse());
    return [ cursorpt.x, cursorpt.y ];
}

// Take svg coordinates to "logical" coordinates used for the actual math/circle calculation
// NOTE that the scaleY transformation applied to the svg element does not LOGICALLY flip the y-axis.
function svgCoordsToLogicalCoords([ x, y ]) {
    return [ x / 100, -y / 100 ];
}

export default class SmithChart extends LitElement {
    static get properties() {
        return {
            // These values are populated when the user clicks the element, "locking" it to a particular r & corresponding z
            // These values are null when the element is "unlocked"
            r: { type: Array },
            z: { type: Array },
            // The "cursor", represented at the intersection of the red figures under the mouse
            pos: { type: Array },
        }
    }
    // Calculate z when r is set and vice versa
    get r() { return this._r }
    set r(val) {
        let old = this._r;
        this._r = val;
        this._z = this._r == null ? null : calcZ(this._r);
        this.requestUpdate('r', old);
    }
    get z() { return this._z }
    set z(val) {
        let old = this._z;
        this._z = val;
        this._r = this._z == null ? null : calcR(this._z);
        this.requestUpdate('z', old);
    }
    constructor() {
        super();
        this.r = null;
        this.pos = [ 0, 0 ];
    }
    static get styles() {
        return css`
            :host {
                display: inline-block;
            }
            svg.cartesian > g {
                transform: scaleY(-1);
            }
            svg.cartesian > g text {
                transform: scaleY(-1);
            }
        `;
    }
    render() {
        // Information to render the cursor:
        // Get the current z from the r-value the mouse is hovering over
        // (Or if we're "locked", just take the z-value that has already been calculated from the r-value)
        const [ czx, czy ] = this.r == null ? calcZ(this.pos) : this.z;
        // Get the guide circles that would intersect at this point
        const posRCircle = rCircle(czx);
        const posICircle = iCircle(czy);
        // At the origin, the imaginary circle is actually a horizontal line; render differently in this case
        const iCircleIsLine = czy == 0;
        // Locked/selected color or unlocked/hover color
        const hoverColor = window.getComputedStyle(this).getPropertyValue('--hover-color') || 'red';
        const selectColor = window.getComputedStyle(this).getPropertyValue('--select-color') || 'blue';
        const cursorColor = this.r == null ? hoverColor : selectColor;

        return html`
            <!-- We work in pixel coordinates of [-100, -100, 100, 100] -->
            <svg class="cartesian" viewBox="-102 -102 204 204" version="1.1" xmlns="http://www.w3.org/2000/svg" @mousemove="${ this.updateCursor }" @click="${ this.toggleLock }">
                <defs>
                    <clipPath id="unit-circle">
                        <circle cx="0" cy="0" r="100"/>
                    </clipPath>
                </defs>
                <g>
                    <!-- coordinate axes -->
                    <path d="M -100 0 L 100 0" stroke="black" stroke-width="0.5" stroke-opacity="0.5" />
                    <path d="M 0 -100 L 0 100" stroke="black" stroke-width="0.5" stroke-opacity="0.5" />

                    <!-- draw the background grid -->
                    ${ backgroundRCircles.map(({ cx, cy, r }, i) => svg`
                        <circle cx="${ cx * 100 }" cy="${ cy * 100 }" r="${ r * 100 }" stroke="black" fill="none" stroke-width="0.3" stroke-opacity="${ i % 5 == 0 ? '0.6' : '0.3' }"/>
                    `) }

                    ${ backgroundICircles.map(({ cx, cy, r }, i) => svg`
                        <circle cx="${ cx * 100 }" cy="${ cy * 100 }" r="${ r * 100 }" stroke="black" fill="none" stroke-width="0.3" stroke-opacity="${ i % 5 == 0 ? '0.6' : '0.3' }" clip-path="url(#unit-circle)"/>
                    `) }

                    <!-- render the first cursor circle -->
                    <circle cx="${ posRCircle.cx * 100 }" cy="${ posRCircle.cy * 100 }" r="${ posRCircle.r * 100 }" stroke="${ cursorColor }" fill="none" stroke-width="0.8" clip-path="url(#unit-circle)"/>

                    <!-- render the other circle, or a horizontal line in the (0, 0) case -->
                    ${ !iCircleIsLine ? svg`
                        <circle cx="${ posICircle.cx * 100 }" cy="${ posICircle.cy * 100 }" r="${ posICircle.r * 100 }" stroke="${ cursorColor }" fill="none" stroke-width="0.8" clip-path="url(#unit-circle)"/>
                    ` : svg`
                        <path d="M -100 0 L 100 0" stroke="${ cursorColor }" stroke-width="0.8" />
                    ` }

                    <!-- render a dot at the selected point when locked -->
                    ${ this.r == null ? null : svg`
                        <circle cx="${ this.r[0] * 100 }" cy="${ this.r[1] * 100 }" r="1.5" fill="${ cursorColor }"/>
                    ` }                    

                </g>
            </svg>
        `;
    }
    updateCursor(e) {
        // Get the svg coordinates and then the logical/mathematical coordinates of the hover point
        if (this.r == null) this.pos = svgCoordsToLogicalCoords(getEventLocationInSvgCoordinates(e));
    }
    toggleLock(e) {
        if (this.r == null) {
            // "Lock" the element at this point
            this.r = svgCoordsToLogicalCoords(getEventLocationInSvgCoordinates(e));
        } else {
            // Unlock the element
            this.r = null;
        }
        this.dispatchEvent(new Event('change'));
    }
}