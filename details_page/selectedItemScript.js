let newsForThisPageClear = null;
window.removeEventListener('scroll', trackScroll);
(function getDataForThisPage () {
    newsForThisPageClear = JSON.parse(localStorage.getItem("selected news"))
    localStorage.removeItem("selected news")
})()
let articleHead = document.querySelector('.articleHead')
let newsTextBlock = document.querySelector('.newsText')
let chosenPageInput = document.querySelector('input')
let pictureBlock = document.querySelector('.picture')

createPageTitle()

createTextOnPage(newsForThisPageClear)

pictureBlock.innerHTML = `<img src = "${newsForThisPageClear[0].fields.thumbnail}" alt ="UI/laptop.png" width = 100%>`

function createPageTitle() {articleHead.innerHTML =` <div class = "articleHead__inner">
                             <div>
                                <h1> ${newsForThisPageClear[0].fields.headline}</h1>
                             </div>
                             <div class = "writerAndDate">
                                  <h3>Written by 'HITak' company</h3>
                                 <div class = "date">
                             ${newsForThisPageClear[0].webPublicationDate.split('T')[0].split("-").reverse().join(' ')}
                                 </div>
                              </div>
                         </div>`}

function createTextOnPage(newsForThisPage) {
    newsTextBlock.innerHTML = `${newsForThisPage[0].fields.body}`
}
let quantity = 0

function findByText (queryString) {
    quantity = 0
    let copyArr = [...newsForThisPageClear]
    let NewBody = copyArr[0].fields.body.split(' ')
        .map(el => {
                if(el.toLowerCase().includes(queryString)){
                    quantity += 1
                    return   `<mark>${el}</mark>`
                }else return el
        }
           ).join(' ')
    let newsForThisPageWithMarks = [{...copyArr[0],...copyArr[0].fields.body = NewBody}]
    alert('found ' + quantity +' matches')
    createTextOnPage(newsForThisPageWithMarks);

}

chosenPageInput.addEventListener('keydown', debounce(()  => findByText(chosenPageInput.value),1000))

function debounce(fn,ms) {
    let timer;
    return (arg) => {
        const letsDoIt = () => fn(arg)
         clearTimeout(timer)
        timer = setTimeout(letsDoIt, ms)

    }

}





