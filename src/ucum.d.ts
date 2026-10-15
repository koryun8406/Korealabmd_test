declare module '@lhncbc/ucum-lhc' {
  export interface UcumResult {
    status: 'succeeded' | 'failed' | 'error';
    code?: string;
    toVal: number | null;
    msg: string[];
  }
  export class UcumLhcUtils {
    static getInstance(): UcumLhcUtils;
    convertUnitTo(
      from: string,
      val: number,
      to: string,
      opts?: { molecularWeight?: number; charge?: number },
    ): UcumResult;
  }
}
