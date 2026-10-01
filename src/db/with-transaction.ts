import {db} from "./index.ts";

// Runs several writes as one: either all of them are saved, or none (ROLLBACK on error)
export const withTransaction = <T>(cb: () => T): T => {
    db.exec('BEGIN');

    try {
        const result = cb();
        db.exec('COMMIT');
        return result;
    } catch (error) {
        db.exec('ROLLBACK');
        throw error;
    }
};
