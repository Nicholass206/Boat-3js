export class Vector {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    clone() {
        let v = new Vector();
        v.x = this.x;
        v.y = this.y;
        v.z = this.z;
        return v;
    }
    sum(input) {
        let c = new Vector();

        c.x = this.x + input.x;
        c.y = this.y + input.y;
        c.z = this.z + input.z;

        return c;
    }
    mult(input) {
        let c = new Vector();

        c.x = this.x * input;
        c.y = this.y * input;
        c.z = this.z * input;

        return c;
    }
    division(input) {
        let c = new Vector();

        c.x = this.x / input;
        c.y = this.y / input;
        c.z = this.z / input;

        return c;
    }
    subtract(input) {
        let c = new Vector();

        c.x = this.x - input;
        c.y = this.y - input;
        c.z = this.z - input;

        return c;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    
    unit() {
        let c = this.length();
        let epsilon = 0.00001;
        if (c < epsilon) {
            return new Vector();
        }
        return this.division(c);
    }


    multNum(input) {
        return this.x * input.x + this.y * input.y + this.z * input.z;
    }

    multVec(input) {
        let c = new Vector();
        c.x = this.y * input.z - this.z * input.y;
        c.y = -(this.x * input.z - this.z * input.x);
        c.z = this.x * input.y - this.y * input.x;
        return c;
    }
}