import { FiPackage, FiGift, FiMapPin, FiCreditCard } from 'react-icons/fi';

export default function Message() {
  const features = [
    { icon: FiPackage, title: '60-Minute Delivery', subtitle: 'Express Delivery' },
    { icon: FiGift, title: 'Delivery Charge Free', subtitle: 'For First Order' },
    { icon: FiMapPin, title: 'Service Area', subtitle: 'Matlab Uttar, Chandpur' },
    { icon: FiCreditCard, title: 'Secure Payment', subtitle: 'Cash On Delivery' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 py-4 px-4 items-stretch">
      {features.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-gray-50 border border-gray-200 shadow-md hover:shadow-none transition-shadow h-full"
          >
            <div className="flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-[#FF5533] shrink-0">
              <Icon className="text-sm md:text-2xl text-[#FF5533]" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] md:text-sm font-semibold text-gray-800">{item.title}</p>
              <p className="text-[10px] md:text-xs text-gray-500">{item.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}