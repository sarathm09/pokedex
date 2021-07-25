const ListPaginationButtons = ({ page, setPage, numberOfPages }) => {
    return (
        <>
            {page !== 1 && (
                <button className='first-page' key='first-page' onClick={() => setPage(1)}>
                    &lt;&lt;
                </button>
            )}
            {page > 1 && (
                <button className='previous-page' key='previous-page' onClick={() => setPage(p => p - 1)}>
                    &lt;
                </button>
            )}
            <button className='current-page' key='current-page' disabled>
                {page}
            </button>
            {page < numberOfPages && (
                <button className='next-page' key='next-page' onClick={() => setPage(p => p + 1)}>
                    &gt;
                </button>
            )}
            {page !== numberOfPages && (
                <button className='last-page' key='last-page' onClick={() => setPage(numberOfPages)}>
                    &gt;&gt;
                </button>
            )}
        </>
    )
}

export default ListPaginationButtons
