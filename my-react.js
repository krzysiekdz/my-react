

function createVElement(tag, config) {
	const {className} = config;

	return {
		tag: tag, 
		className,
		dom: null,
	};
}

function mountVElement(vElement, parentDOMNode) {
	const {tag, className} = vElement;
	const domNode = document.createElement(tag);
	vElement.dom = domNode;
	if(className !== undefined) {
		domNode.className = className;
	}
	parentDOMNode.appendChild(domNode);
}



//------------------- test app
(function testApp() {
	const parent = document.querySelector('#app');
	const app = createVElement('div', {className: 'my-class'});
	mountVElement(app, parent);
})();

