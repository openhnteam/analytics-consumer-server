export type DBDataValidatorHandler = (entityList: any[]) => Promise<any[]>;

export interface DBDataValidator {
    validAction: DBDataValidatorHandler
}