import { render, screen } from '@testing-library/react';
import ProgressRing from '../components/ProgressRing';

describe('ProgressRing', () => {
  it('renders current amount and goal', () => {
    render(<ProgressRing current={500} goal={2000} />);
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('/ 2000 ml')).toBeInTheDocument();
  });

  it('shows correct percentage', () => {
    render(<ProgressRing current={1000} goal={2000} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('caps percentage at 100%', () => {
    render(<ProgressRing current={3000} goal={2000} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows 0% when no intake', () => {
    render(<ProgressRing current={0} goal={2000} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('uses green stroke when goal is met', () => {
    const { container } = render(<ProgressRing current={2000} goal={2000} />);
    const circles = container.querySelectorAll('circle');
    // Second circle is the progress circle
    expect(circles[1].getAttribute('stroke')).toBe('#22c55e');
  });

  it('uses blue stroke when goal is not met', () => {
    const { container } = render(<ProgressRing current={500} goal={2000} />);
    const circles = container.querySelectorAll('circle');
    expect(circles[1].getAttribute('stroke')).toBe('#3b82f6');
  });
});
