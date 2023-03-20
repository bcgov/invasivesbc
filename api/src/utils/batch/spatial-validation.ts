const wkt = require('wkt');
const { parse } = require('wkt');

export const validateAsWKT = (input: string) =>
{
    try
    {
        const parsed = parse(input)
        return (parsed !== null)? true: false
    }
    catch(e){
        console.log('invalid wkt: ' + input)
    }
    return false;
}