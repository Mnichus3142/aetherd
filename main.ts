import {
  atan2, chain, derivative, e, evaluate, log, pi, pow, round, sqrt
} from 'mathjs'

import { listInstalled } from './lib/functions';

const evaluateExpression = (prompt: string) => {
    try {
        const result = evaluate(prompt, {
            atan2,
            derivative,
            e,
            log,
            pi,
            pow,
            round,
            sqrt
        });

        console.log(result);
        return result.toString();
    } catch (error) {
        return listInstalled(prompt).join(', ');
    }
}

export { evaluateExpression };