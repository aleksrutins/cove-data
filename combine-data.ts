import * as sources from './data-sources.ts';
import {_mut} from './mutate.ts';
import { readCSVObjects } from "https://deno.land/x/csv/mod.ts";
import { DataRow } from './types.ts';

let output: DataRow[] = [];

async function getHospitalizationCsvUrls(): Promise<string[]> {
    let revisions = readCSVObjects(await fetch(sources.HHS_HOSPITALIZATION_REVISIONS_URL));
    return revisions.slice(revisions.length - 9).map(rev => rev['Archive Link'])
}

async function getHospitalizationDailies() {
    const csvUrls = await getHospitalizationCsvUrls();
    let dataFrames = [];
    for(let url of csvUrls) {
        let data = readCSVObjects(await fetch(url)).mutate({reporting_cutoff_start: _mut(() => {
            let dt = new Date(row.reporting_cutoff_start);
            dt.setDate(dt.getDate() + 4);
            return dt.toString();
        })});
        dataFrames.push(data);
    }
    return dataFrames;
}
function parseDate(date: string): string {
    if(date.indexOf(':') >= 0) {
        return new Date(date).toString();
    }
    return new Date(date).toDateString();
}

let [testing, hospitalization, case_death] = await [sources.HHS_TESTING_URL, sources.HHS_HOSPITALIZATION_URL, sources.CDC_CASE_DEATH_URL].map(async url => readCSVObjects(await fetch(url)));