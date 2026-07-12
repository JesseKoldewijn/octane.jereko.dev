// Server element utilities missing from published octane@0.1.3 (present in monorepo main).
function isElementDescriptor(v) {
	return v != null && v.$$kind === ELEMENT_TAG;
}

function positionalChildren(children) {
	return children;
}

function isValidElement(v) {
	return isElementDescriptor(v);
}

function cloneElement(element, config, ...children) {
	if (!isElementDescriptor(element)) {
		throw new Error(
			'cloneElement: the first argument must be an element (from createElement / JSX).',
		);
	}
	const props = { ...element.props };
	let key = element.key;
	if (config != null) {
		if (config.key !== undefined && config.key !== null) key = config.key;
		for (const name in config) {
			if (name === 'key') continue;
			if (Object.prototype.hasOwnProperty.call(config, name)) props[name] = config[name];
		}
	}
	const n = children.length;
	let kids;
	if (n === 1) {
		kids = children[0];
	} else if (n > 1) {
		kids = children;
	} else {
		kids = 'children' in props ? props.children : element.children;
	}
	if (kids !== undefined) props.children = kids;
	return { $$kind: ELEMENT_TAG, type: element.type, props, key, children: kids ?? null };
}

function traverseChildren(children, fn) {
	if (children == null) return 0;
	let index = 0;
	const walk = (node) => {
		if (Array.isArray(node)) {
			for (let i = 0; i < node.length; i++) walk(node[i]);
			return;
		}
		fn(node == null || typeof node === 'boolean' ? null : node, index++);
	};
	walk(children);
	return index;
}

const Children = {
	forEach(children, fn) {
		traverseChildren(children, fn);
	},
	map(children, fn) {
		if (children == null) return children;
		const out = [];
		traverseChildren(children, (child, i) => {
			const mapped = fn(child, i);
			if (Array.isArray(mapped)) {
				for (const m of mapped) if (m != null && typeof m !== 'boolean') out.push(m);
			} else if (mapped != null && typeof mapped !== 'boolean') {
				out.push(mapped);
			}
		});
		return out;
	},
	count(children) {
		return traverseChildren(children, () => {});
	},
	toArray(children) {
		const out = [];
		traverseChildren(children, (child) => {
			if (child != null) out.push(child);
		});
		return out;
	},
	only(children) {
		if (!isElementDescriptor(children)) {
			throw new Error('Children.only expected to receive a single element child.');
		}
		return children;
	},
};

function createPortal(body, target, props = undefined) {
	return { $$kind: PORTAL_TAG, body, target, props };
}
