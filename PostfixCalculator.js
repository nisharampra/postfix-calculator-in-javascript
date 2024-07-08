
class PostfixCalculator {
    constructor() {
        this.stack = [];
        this.variables = {}; // Symbol table for variables
    }

    evaluate(postfixExpr) {
        const tokens = postfixExpr.split(' ');

        tokens.forEach(token => {
            if (this.isOperator(token)) {
                if (this.stack.length < 2) {
                    throw new Error('Invalid postfix expression');
                }
                const operand2 = this.stack.pop();
                const operand1 = this.stack.pop();
                const result = this.applyOperator(token, operand1, operand2);
                this.stack.push(result);
            } else if (this.isVariable(token)) {
                if (!(token in this.variables)) {
                    throw new Error('Undefined variable');
                }
                this.stack.push(this.variables[token]); // Push variable value onto stack
            } else if (token === '=') {
                if (this.stack.length < 2) {
                    throw new Error('Invalid postfix expression');
                }
                const value = this.stack.pop();
                const variable = this.stack.pop();
                if (!this.isVariable(variable)) {
                    throw new Error('Invalid variable name');
                }
                this.setVariableValue(variable, value); // Set variable value in symbol table
            } else {
                this.stack.push(parseFloat(token));
            }
        });

        if (this.stack.length !== 1) {
            throw new Error('Invalid postfix expression');
        }

        return this.stack.pop();
    }

    applyOperator(op, operand1, operand2) {
        switch (op) {
            case '+': return operand1 + operand2;
            case '-': return operand1 - operand2;
            case '*': return operand1 * operand2;
            case '/': return operand1 / operand2;
            case '^': return Math.pow(operand1, operand2);
            default: throw new Error('Invalid operator');
        }
    }

    isOperator(token) {
        return ['+', '-', '*', '/', '^'].includes(token);
    }

    isVariable(token) {
        return /^[A-Z]$/.test(token); // Assumes variables are single uppercase letters
    }

    setVariableValue(variable, value) {
        this.variables[variable] = value; // Update or insert variable value in symbol table
    }
}

module.exports = PostfixCalculator;
