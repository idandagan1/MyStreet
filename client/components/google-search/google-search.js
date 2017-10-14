/* eslint-disable no-undef */
import React, { Component, PropTypes } from 'react';
import './google-search.scss';


const initialState = {
    streetName: '',
    placeId: '',
    address: '',
    location: [34.7818, 32.0853],
}

export default class GoogleSearch extends Component {

    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
        Strings: PropTypes.shape({
            search: PropTypes.string,
        }),
    };

    constructor(props) {
        super(props);
        this.state = initialState;
    }

    componentDidMount() {

        const input = this.search;
        const autocomplete = new google.maps.places.Autocomplete(input);

        google.maps.event.addListener(autocomplete, 'place_changed', () => {
            const place = autocomplete.getPlace();
            this.setState({
                streetName: place.address_components[0].long_name,
                address: place.formatted_address,
                placeId: place.place_id,
                location: [place.geometry.location.lng(), place.geometry.location.lat()],
            });
        });
    }

    handleSearchClicked = e => {
        e.preventDefault();
        const { onSubmit } = this.props;
        const { streetName, location, placeId, address } = this.state;

        if (!streetName || !placeId) {
            return;
        }

        const res = {
            address,
            streetName,
            location,
            placeId,
        };
        this.search.value = '';
        this.setState(initialState);
        onSubmit(res);
    };

    render() {
        const { Strings } = this.props;

        return (
            <div className='n-google-search-form'>
                <form onSubmit={this.handleSearchClicked} className='form-horizontal'>
                    <input
                        dir='auto'
                        id='googlesearchtxt'
                        type='text'
                        placeholder={Strings.findMyStreet}
                        autoComplete='off'
                        className='form-control n-google-search-textfield'
                        ref={search => { this.search = search; }}
                        required='true'
                    />
                    <input
                        type='submit'
                        id='searchsubmit-m'
                        className='btn n-google-search-btn-search'
                        value={Strings.search}
                    />
                    <input
                        type='submit'
                        id='searchsubmit-s'
                        className='btn n-google-search-btn-search'
                        value={Strings.search}
                        data-toggle='collapse'
                        data-target='#bs-example-navbar-collapse-1'
                        aria-expanded='false'
                    />
                </form>
            </div>
        );
    }
}
