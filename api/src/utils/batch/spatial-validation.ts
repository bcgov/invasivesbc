const wkt = require('wkt');
const { parse } = require('wkt');

export const validateAsWKT = (input: string) =>
{
    try
    {
        const parsed = parse(input)
        return true;
    }
    catch(e){
        console.log('invalid wkt: ' + input)
    }
    return false;
}