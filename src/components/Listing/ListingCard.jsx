import { Link } from 'react-router-dom';

export const ListingCard = ({ listing }) => {
    return (
        <div className="card">
            <img
                src={listing.image}
                alt={listing.title}
                className="card-image"
            />
            <div className="card-content">
                <h3 className="card-title">{listing.title}</h3>
                <p className="card-location">{listing.location}</p>
                <p className="card-price">${listing.price} / night</p>
                <div className="card-details">
                    <span>{listing.bedrooms} beds</span>
                    <span>•</span>
                    <span>{listing.bathrooms} baths</span>
                    <span>•</span>
                    <span>Up to {listing.maxGuests} guests</span>
                </div>
                <Link
                    to={`/listings/${listing.id}`}
                    className="btn btn-primary w-100 mt-2"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
}; 