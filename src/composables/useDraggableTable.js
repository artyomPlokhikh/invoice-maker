import { ref } from 'vue';

export function useDraggableTable(items) {
    const draggedItemIndex = ref(null);
    const isDragTarget = ref(null);
    const isDragging = ref(false);
    const itemsTableBody = ref(null);
    const draggedRowElement = ref(null);
    const dragStartY = ref(0);
    const mouseOffsetY = ref(0);

    function prepareForDrag(index) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        draggedItemIndex.value = index;
        dragStartY.value = 0;
    }

    function handleMouseUp() {
        if (isDragging.value) {
            finishDrag();
        }

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        draggedItemIndex.value = null;
        isDragTarget.value = null;
        dragStartY.value = 0;
        isDragging.value = false;
    }

    function startActualDrag(event) {
        const rows = Array.from(itemsTableBody.value.children);
        const draggedRow = rows[draggedItemIndex.value];

        draggedRowElement.value = draggedRow.cloneNode(true);
        const rect = draggedRow.getBoundingClientRect();

        mouseOffsetY.value = event.clientY - rect.top;

        Object.assign(draggedRowElement.value.style, {
            position: 'fixed',
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            zIndex: 1000,
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
            backgroundColor: '#f0f9ff',
            transition: 'transform 0.05s ease-out',
            opacity: 0.95
        });

        document.body.appendChild(draggedRowElement.value);

        draggedRow.style.visibility = 'hidden';
    }

    function finishDrag() {
        if (draggedRowElement.value) {
            draggedRowElement.value.remove();
            draggedRowElement.value = null;
        }

        const rows = Array.from(itemsTableBody.value.children);
        if (draggedItemIndex.value !== null && rows[draggedItemIndex.value]) {
            rows[draggedItemIndex.value].style.visibility = 'visible';
        }

        if (isDragTarget.value !== null && draggedItemIndex.value !== isDragTarget.value) {
            const fromIndex = draggedItemIndex.value;
            const toIndex = isDragTarget.value;

            const itemToMove = { ...items[fromIndex] };

            items.splice(fromIndex, 1);
            items.splice(toIndex, 0, itemToMove);
        }
    }

    function handleMouseMove(event) {
        if (!isDragging.value) {
            if (!dragStartY.value) {
                dragStartY.value = event.clientY;
                return;
            }

            if (Math.abs(event.clientY - dragStartY.value) < 5) {
                return;
            }

            startActualDrag(event);
            isDragging.value = true;
        }

        if (!draggedRowElement.value) return;

        const currentY = event.clientY - mouseOffsetY.value;
        draggedRowElement.value.style.transform = `translateY(${currentY}px)`;

        const rows = Array.from(itemsTableBody.value.children);
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rect = row.getBoundingClientRect();
            const rowMiddle = rect.top + rect.height / 2;

            if (event.clientY < rowMiddle) {
                isDragTarget.value = parseInt(row.dataset.index);
                break;
            } else if (i === rows.length - 1) {
                isDragTarget.value = parseInt(row.dataset.index);
            }
        }
    }

    return {
        draggedItemIndex,
        isDragTarget,
        itemsTableBody,
        prepareForDrag
    };
}