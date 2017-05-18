import React, { PropTypes } from 'react';
import streeticon from 'resources/images/street-icon.png';

export default function Street(props) {

    const { streetName, i, onStreetClick } = props;

    return (
        <li style={{ height: 42 }} key={i}>
            <div role='button' className='n-street-item' onClick={onStreetClick}>
                <img className='n-comment-user-icon' alt='street-icon' src={streeticon} role='img' />
                <div style={{ height: 8 }} />
                <span><b>{streetName}</b></span>
            </div>
            <div className='dropdown show street-caret'>
                <a className='n-post-user' id='dropdownMenuLink' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    <span className='caret' />
                </a>
                <ul className='dropdown-menu' aria-labelledby='dropdownMenuLink'>
                    <li><span className='n-mystreet-street-item'>Set as primary street</span></li>
                    <li><span className='n-mystreet-street-item'>Leave street</span></li>
                </ul>
            </div>
        </li>
    );
}

Street.propTypes = {
    streetName: PropTypes.string,
    i: PropTypes.number,
    onStreetClick: PropTypes.func.isRequired,
}
