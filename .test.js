module.exports.run = async (page, base, shot) => {
  const out=[];
  async function ask(q){
    await page.evaluate(t=>{document.querySelector('#inp').value=t;document.querySelector('#sendBtn').click()},q);
    await new Promise(r=>setTimeout(r,1400));
    return page.evaluate(()=>{const m=[...document.querySelectorAll('.msg.bot')];return m[m.length-1].childNodes[0].textContent});
  }
  out.push(['greeting', await ask('hello there')]);
  out.push(['math', await ask('what is 12% of 850')]);
  out.push(['arith', await ask('calculate 25 * 48')]);
  out.push(['name set', await ask('my name is Akash')]);
  out.push(['name recall', await ask('what is my name')]);
  out.push(['joke conf', await page.evaluate(()=>{const c=[...document.querySelectorAll('.conf')];return c.length?c[c.length-1].textContent:'none'})]);
  out.push(['unknown', await ask('explain quantum chromodynamics in detail')]);
  out.push(['help', (await ask('what can you do')).slice(0,60)]);
  await page.screenshot({path:shot});
  return out;
};
