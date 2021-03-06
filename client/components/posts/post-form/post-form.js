import React, { PropTypes } from 'react';
import moment from 'moment';
import { FileLoader } from 'components';
import deleteIcon from 'resources/images/delete-icon.png';
import superagent from 'superagent';
import $ from 'jquery';
import './post-form.scss';

export default class PostForm extends React.Component {

    static propTypes = {
        addNewPost: PropTypes.func.isRequired,
        username: PropTypes.string,
        Strings: PropTypes.shape({
            search: PropTypes.string,
        }),
    }

    constructor(props) {
        super(props);
        this.state = {
            url: '',
            params: {},
            image: '',
            body: '',
        };

    }

    onFileUpload = (url, params, image) => {
        this.setState({
            url,
            params,
            image,
        });

        this.readURL(image);
    }

    onSubmitForm = (e) => {
        e.preventDefault();
        const { url, params, image } = this.state;
        this.setState({ body: this.formfield.value });
        if (!url || !params || !image) {
            this.submitPost();
            return;
        }

        this.submitImage(url, params, image);
    }

    submitImage = (url, params, image) => {

        let progressVal;
        const uploadRequest = superagent.post(url).on('progress', (e) => {
            progressVal = Math.round((e.loaded * 100.0) / e.total);
            if (Number.isInteger(progressVal)) {
                $('.progress-bar').css('width', `${progressVal}%`);
                $('.progress-bar').text(`${progressVal}%`);
            }
        });
        uploadRequest.attach('file', image);
        uploadRequest.attach('face_coordinates', 'a_ignore');

        Object.keys(params).forEach((key) => {
            uploadRequest.field(key, params[key]);
        });
        $('#progressWrapper').fadeIn('slow');
        this.cleanInputs();
        uploadRequest.end((err, resp) => {
            this.afterProgressBarEnd();
            if (err) {
                console.log(err.response.body.error.message);
                alert('unable to upload photo, please try again later');
                this.cleanInputs();
                return;
            }
            this.submitPost(resp.body.secure_url);
        });
    }

    readURL = (image) => {

        if (image) {
            const reader = new FileReader();

            reader.onload = (e) => {
                $('#prevWrapper').show();
                $('#imgpreview').attr('src', e.target.result);
            }

            reader.readAsDataURL(image);
        }
    }

    onDeleteImgPrev = () => {
        document.getElementById('fileInputId').value = '';
        $('#prevWrapper').hide();
        $('#imgpreview').attr('src', '#');
        this.setState({
            url: '',
            params: {},
            image: '',
        });
    }

    afterProgressBarEnd = () => {
        $('#progressWrapper').fadeOut();
        setTimeout(() => {
            $('.progress-bar').text('0%');
            $('.progress-bar').css('width', '0%');
        }, 3000);
    }

    submitPost = (imageUrl) => {
        const { addNewPost } = this.props;

        const newPost = {
            body: this.formfield.value,
            createDate: moment(),
            comment: [],
            imageUrl,
        }

        addNewPost(newPost);
        this.cleanInputs();
    }

    cleanInputs = () => {
        this.formfield.value = '';
        document.getElementById('fileInputId').value = '';
        $('#prevWrapper').hide();
        $('#imgpreview').attr('src', '#');
        this.setState({
            url: '',
            params: {},
            image: '',
        });
    }

    render() {
        const { username, Strings } = this.props;
        return (
            <div>
                <div className='panel'>
                    <div className='panel-content'>
                        <form onSubmit={this.onSubmitForm} className='form center-block'>
                            <input
                                type='hidden'
                                ref={imagepath => { this.imagepath = imagepath; }}
                                value={this.state.imageurl}
                            />
                            <div className='panel-body n-post-form'>
                                <div>
                                    <textarea
                                        ref={formfield => { this.formfield = formfield; }}
                                        className='form-control input-lg n-postform-textarea'
                                        placeholder={Strings.postPlaceholder + username}
                                        required='true'
                                    />
                                </div>
                            </div>
                            <div id='prevWrapper' style={{ display: 'none' }}>
                                <img
                                    id='imgpreview'
                                    src='#'
                                    alt='imgpreview'
                                    className='img-responsive img-preview'
                                />
                                <img
                                    alt='delete'
                                    className='delete-prev'
                                    onClick={this.onDeleteImgPrev}
                                    src={deleteIcon}
                                />
                            </div>
                            <div className='panel-footer n-postform-footer'>
                                <div className='n-footer-filepicker'>
                                    <ul className='pull-left list-inline'>
                                        <li>
                                            <FileLoader onFileUpload={this.onFileUpload} />
                                        </li>
                                    </ul>
                                </div>
                                <div className='n-post-btn-wrapper'>
                                    <button
                                        type='submit'
                                        className='btn btn-sm postbutton n-btn-post'
                                    >
                                        {Strings.post}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div id='progressWrapper' className='panel' style={{ display: 'none' }}>
                    <div id='progressTxt'>{Strings.uploadPost}</div>
                    <div className='progress'>
                        <div
                            className='progress-bar'
                            role='progressbar'
                            style={{ width: '0%' }}
                            aria-valuenow='0'
                            aria-valuemin='0'
                            aria-valuemax='100'
                        >0%</div>
                    </div>
                </div>
            </div>
        );
    }
}
