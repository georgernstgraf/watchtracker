function selectThis(evt) {
    if (evt.type == 'keyup' && evt.key != 'Enter') return;
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('timeZones');
    console.log('event');
    console.log(evt.target);
    if (searchResults.selectedIndex == -1) return;
    searchInput.value = searchResults.value;
    let node = document.getElementById('timeZones').parentElement;
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}
