const S4 = () => {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
 
// Generate a unique guid (Stolen from stack overflow)
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();

export default guid;